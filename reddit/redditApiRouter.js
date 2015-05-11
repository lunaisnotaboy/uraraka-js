var express = require('express');
var router = express.Router();
var redditApiHandler = require('./redditApiHandler');
var redditAuth = require('./redditAuth');


/* REDDIT ROUTER */

/*
	User restricted Reddit Api paths
 */

router.all('/uauth/*', function(req, res, next) {
  redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
	  if (authenticated) {
		  next();
	  } else {
		  var error = new Error("Not authorized to view this resource");
		  error.status = 401;
		  next(error);
	  }
  });
});

router.get('/uauth/me', function(req, res, next) {
	redditApiHandler.me(req.session.generatedState, function(data){
		res.json(data);
	});
});

router.post('/uauth/vote', function(req, res, next) {
	// console.log('vote: ' + req.body.id + req.body.dir);
	redditApiHandler.vote(req.session.generatedState, req.body.id, req.body.dir, function(data){
		// if(data) console.log('data ' + JSON.stringify(data));
		res.sendStatus(200);
	});
});

router.post('/uauth/save', function(req, res, next) {
	redditApiHandler.save(req.session.generatedState, req.body.id, function(data){
		res.sendStatus(200);
	});
});

router.post('/uauth/unsave', function(req, res, next) {
	redditApiHandler.unsave(req.session.generatedState, req.body.id, function(data){
		res.sendStatus(200);
	});
});

router.post('/uauth/comment', function(req, res, next) {
	redditApiHandler.commentUser(req.session.generatedState, req.body.parent_id, req.body.text, function(data) {
		res.json(data);
	});
});

/*
	Reddit Api Paths
 */


// Not Req. Angular always calls with a sort parameter.

// router.get('/subreddit/:sub', function(req, res, next) {

// 	redditAuth.isLoggedIn(req.session.geenratedState, function(authenticated) {
// 		if (authenticated) {
// 			redditApiHandler.subredditUser(req.session.generatedState, req.params.sub, 'hot', 48, "", "", function(data) {
// 				res.json(data.get.data.children);
// 			});
// 		} else {
// 			redditApiHandler.subreddit(req.params.sub, 'hot', 48, "", "", function(data) {
// 				res.json(data.get.data.children);
// 			});
// 		}
// 	});
// });

router.get('/subreddit/:sub/:sort', function(req, res, next) {

	redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
		if (authenticated) {
			redditApiHandler.subredditUser(req.session.generatedState, req.params.sub, req.params.sort, 48, req.query.after, req.query.t, function(data) {
				res.json(data.get.data.children);
			});
		} else {
			redditApiHandler.subreddit(req.params.sub, req.params.sort, 48, req.query.after, req.query.t, function(data) {
				res.json(data.get.data.children);
			});
		}
	});

});

router.get('/subreddits', function(req, res, next) {

	redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
		if (authenticated) {
			redditApiHandler.subredditsUser(req.session.generatedState, function(data) {
				res.json(data.get.data.children);
			});
		} else {
			redditApiHandler.subreddits(function(data) {
				res.json(data.get.data.children);
			});
		}
	});

});

router.get('/comments/:subreddit/:article', function(req, res, next) {
	redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
		if (authenticated) {
			redditApiHandler.commentsUser(req.session.generatedState, req.params.subreddit, req.params.article, req.query.sort, req.query.comment, req.query.context, function(data) {
				res.json(data);
			});
		} else {
			redditApiHandler.comments(req.params.subreddit, req.params.article, req.query.sort, req.query.comment, req.query.context, function(data) {
				res.json(data);
			});
		}
	});
});

router.get('/morechildren', function(req, res, next) {
	redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
		if (authenticated) {
			redditApiHandler.moreChildrenUser(req.session.generatedState, req.query.link_id, req.query.children, req.query.sort, function(data) {
				res.json(data);
			});
		} else {
			redditApiHandler.moreChildren(req.query.link_id, req.query.children, req.query.sort, function(data) {
				res.json(data);
			});
		}
	});
});

router.get('/user/:username/:where', function(req, res, next) {
	redditAuth.isLoggedIn(req.session.generatedState, function(authenticated) {
		if (authenticated) {
			redditApiHandler.userUser(req.session.generatedState, req.params.username, req.params.where, req.query.sort, 48, req.query.after, req.query.t, function(data) {
				res.json(data.get.data.children);
			});
		} else {
			redditApiHandler.user(req.params.username, req.params.where, req.query.sort, 48, req.query.after, req.query.t, function(data) {
				res.json(data.get.data.children);
			});
		}
	})
});

module.exports = router;