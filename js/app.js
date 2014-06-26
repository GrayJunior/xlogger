App = Ember.Application.create({
    LOG_TRANSITIONS_INTERNAL: true
});

App.Router.map(function () {
    this.resource('index', {path: '/'}, function () {
        this.resource('notification');
    });
    this.resource('about', {path: '/about'});
    this.resource('how-to-use', {path: '/how-to-use'});

    this.resource('post', {path: '/post/:id'}, function () {
        this.route('comment', {path: '/comment'});
    });
});

App.IndexRoute = Ember.Route.extend({
    model: function () {
        return logs;
    }
});

App.IndexController = Ember.ArrayController.extend({
    authors: '',
    handlers: '',
    points: '',
    days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    years: ['2014'],
    notification_message: '',
    notification_url: '',

    isLoggedIn: false,
    isEditingLog: false,
    hasNotification: false,
    onShowDialog: false,

    dialog: {
        'dialog-type': '',
        'dialog-title': '',
    },

    init: function () {
        this.set('authors', authorList);
        this.set('handlers', handlerList);
        this.set('points', difficultyPoints);

        this.checkLoginStatus();
    },

    checkLoginStatus: function () {
        if (!this.isLoggedIn) {
            setTimeout(function () {
                    $('#login').modal('toggle');
            }, 1);
        }
    },

    printPointsCode: function (value) {
        if (value > 4) {
            return 'progress-bar progress-bar-warning';
        } else if (value > 7) {
            return 'progress-bar progress-bar-danger';
        } else {
            return 'progress-bar progress-bar-success';
        }
    },

    actions: {
        onLogIn: function () {
            $('#login').modal('toggle');
        },

        onLoggingIn: function () {
            var _this = this;
            //FIXME: why do we need to use timeout to keep in cycle?
            setTimeout(function () {
                _this.set('isLoggedIn', true);
            }, 500);
        },

        onLogOut: function () {
            var _this = this;
            $('#loading').modal('toggle');
            setTimeout(function () {
                $('#loading').modal('toggle');
                _this.send('onLoggingOut');
            }, 1200);
        },

        onLoggingOut: function () {
            var _this = this;
            //FIXME: why do we need to use timeout to keep in cycle?
            setTimeout(function () {
                _this.set('isLoggedIn', false);
            }, 100);
        },

        onAddNewLog: function () {
            this.set('dialog', {
                'dialog-title': 'Add a New Log'
            });

            this.set('isEditingLog', false);
            this.set('onShowDialog', true);
        },

        onConfirmAddNewLog: function () {
            var data = this.get('content'),
                _this = this,
                pointsCode = function () {
                };

            if (!this.get('title') && !this.get('author')) {
                this.set('hasNotification', true);
                this.send('onUpdateNotification', 'Invalid input! Please ensure that you have at least title and author stated before adding a new log.');
                return;
            } else {
                console.log('not true');
            }

            data.pushObject({
                id: data.length + 1,
                title: this.get('title'),
                postDateDay: this.get('logDays'),
                postDateMonth: this.get('logMonths'),
                postDateYear: this.get('logYear'),
                points: {
                    val: this.get('pointsValue'),
                    code: this.printPointsCode(this.get('pointsValue')),
                    style: 'width: '+this.get('pointsValue')+'0%'
                },
                author: this.get('author'),
                handledBy: this.get('handledBy'),
                post: this.get('post'),
                notes: this.get('notes'),
                flag: 'in progress',
                tags: ['v0.1', '24-mar-request'],
                comments: []
            });

            console.log(data);

            this.set('hasNotification', true);
            this.send('onUpdateNotification', 'You have just added a new log! View your log.', '#'+(data.length - 1));
        },

        onConfirmChanges: function () {
            var data = this.get('content'),
                 title = this.get('selectedLog.title'),
                 author = this.get('selectedLog.author'),
                 handler = this.get('selectedLog.handledBy'),
                 post = this.get('selectedLog.post'),
                 notes = this.get('selectedLog.notes');

            if (!this.get('isEditingLog')) {
                this.send('onConfirmAddNewLog');
            } else {
                this.send('onConfirmEditExistingLog');
            }
        },

        onCancelChanges: function () {
            console.log(this.selectedLog);
            console.log('onCancelChanges');
            this.set('onShowDialog', false);
        },

        closeNotification: function () {
            this.set('hasNotification', false);
            this.send('onUpdateNotification', '');
        },

        onUpdateNotification: function (message, url) {
            this.set('notification_message', message);
            this.set('notification_url', url);
        },

        onEditExistingLog: function (log) {
            this.set('dialog', {
                'dialog-title': 'Edit Existing Log'
            });
            this.selectedLog = Ember.copy(log,true);

            this.set('isEditingLog', true);
            this.set('onShowDialog', true);
        },

        onConfirmEditExistingLog: function (e) {
            var  data = this.get('content');

            console.log(this.printPointsCode(this.selectedLog.points.val));
            data.replace(this.selectedLog.id - 1, 1, [{
                id: data.length,
                title: this.selectedLog.title,
                postDateDay: this.selectedLog.postDateDay,
                postDateMonth: this.selectedLog.postDateMonth,
                postDateYear: this.selectedLog.postDateYear,
                points: {
                    val: this.selectedLog.points.val,
                    code: this.printPointsCode(this.selectedLog.points.val),
                    style: 'width: '+this.selectedLog.points.val+'0%'
                },
                author: this.selectedLog.author,
                handledBy: this.selectedLog.handledBy,
                post: this.selectedLog.post,
                notes: this.selectedLog.notes,
                flag: 'done',
                tags: ['v0.1', '24-mar-request'],
                comments: []
            }]);

            if (!this.selectedLog.title && !this.selectedLog.author) {
                this.set('hasNotification', true);
                return;
            }
        },
    }
});

App.PostIndexRoute = Ember.Route.extend({
    model: function (params) {
        console.log('postIndex: '+params.id);
    }
});

App.PostCommentRoute = Ember.Route.extend({
    renderTemplate: function () {
        this.render({
            into: 'application'
        });
    }
});

var difficultyPoints = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var authorList = ['Gray Ang', 'Lax Chee', 'guy', 'girl'];

var handlerList = ['Gray Ang', 'Lax Chee', 'guy', 'girl'];

var logs = [
    {
        id: '1',
        title: "Requested to change colors to basic theme.",
        postDateDay: 26,
        postDateMonth: 'Mar',
        postDateYear: '2014',
        points: {
            val: 3,
            code: 'progress-bar progress-bar-success',
            style: 'width: 30%'
        },
        author: "Gray Ang",
        handledBy: 'Lax Chee',
        post: "Fixed - changed the colors as required by someone in the galaxy.",
        notes: "This is important note that will be cast into a panel for stronger emphasis.",
        flag: 'accepted',
        tags: ['v0.1', '24-mar-request'],
        comments: [
        {
            author: 'Oliya',
            body: "I said this but that didn't listen. So please just go ahead and do it, if it doesn't take up a lot of time.",
            commentdate: 'Thursday, 27 Mar 2014'
        }
        ]
    },
    {
        id: '2',
        title: "Carousel broken in home page.",
        postDateDay: 28,
        postDateMonth: 'Mar',
        postDateYear: '2014',
        points: {
            val: 8,
            code: 'progress-bar progress-bar-danger',
            style: 'width: 80%'
        },
        author: "Gray Ang",
        handledBy: 'Lax Chee',
        post: "Library is broken. We need to change to another one. - Major change",
        notes: "This is important note that will be cast into a panel for stronger emphasis.",
        flag: 'in progress',
        tags: ['v0.1', '24-mar-request'],
        comments: [
        {
            author: 'Oliya',
            body: "They confirmed that this is no longer required. Please remove this from tracker. Thanks.",
            commentdate: 'Monday, 1 Apr 2014'
        },
        {
            author: 'Lax Chee',
            body: "Roger that. Shall revert the changes then.",
            commentdate: 'Monday, 1 Apr 2014'
        }
        ]
    }
];
