const express = require('express');
const router = express.Router();
const { Article, User } = require('../models');


/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
}

async function checkForLoggedInState(req) {
  const { username } = req.cookies;
  let foundUser;
  if (username) {
    foundUser = await User.findOne({
      where: { username }
    })
  }
  return (foundUser ? true : false);
}

/* GET articles listing. */
router.get('/', asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  const articles = await Article.findAll({ order: [["createdAt", "DESC"]] });
  console.log('loggedIn: ', loggedIn)
  res.render("articles/index", { articles, title: "Sequelize-It!", loggedIn });
}));

/* Create a new article form. */
router.get('/new', async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    res.render("articles/new", { article: {}, title: "New Article" });
  } else {
    res.redirect('/articles');
  }

});

/* POST create article. */
router.post('/', asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    let article;
    try {
      article = await Article.create(req.body);
      res.redirect("/articles/" + article.id);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        article = await Article.build(req.body);
        res.render("articles/new", { article, errors: error.errors, title: "New Article" })
      } else {
        throw error; //error caught in the asyncHandler's catch block
      }
    }
  } else {
    res.redirect('/articles');
  }

}));

/* Edit article form. */
router.get("/:id/edit", asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    const article = await Article.findByPk(req.params.id);
    if (article) {
      res.render("articles/edit", { article, title: "Edit Article" });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect('/articles');
  }


}));

/* GET individual article. */
router.get("/:id", asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  const article = await Article.findByPk(req.params.id);
  if (article) {
    res.render("articles/show", { article, title: article.title, loggedIn});
  } else {
    res.sendStatus(404);
  }
}));

/* Update an article. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    let article;
    try {
      article = await Article.findByPk(req.params.id);
      if (article) {
        await article.update(req.body);
        res.redirect("/articles/" + article.id);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        article = await Article.build(req.body);
        article.id = req.params.id; //make sure correct article gets id
        res.render("articles/edit", { article, errors: error.errors, title: "Edit Article" });
      } else {
        throw error;
      }
    }
    if (article) {
      await article.update(req.body);
      res.redirect("/articles/" + article.id);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect('/articles');
  }
}));

/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    const article = await Article.findByPk(req.params.id);
    if (article) {
      res.render("articles/delete", { article, title: "Delete Article" });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect('/articles');
  }
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const loggedIn = await checkForLoggedInState(req);
  if (loggedIn) {
    const article = await Article.findByPk(req.params.id);
    if (article) {
      await article.destroy();
      res.redirect("/articles");
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect('/articles');
  }
}));

module.exports = router;