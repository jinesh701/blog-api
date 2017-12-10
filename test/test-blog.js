const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const should = chai.should();

chai.use(chaiHttp);

describe("Blog Post", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it(`Should show a list of blog posts on GET`, function() {
    chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");

        res.body.length.should.be.at.least(1);

        const expectedKeys = [
          "id",
          "title",
          "content",
          "author",
          "publishDate"
        ];
        res.body.forEach(function(item) {
          item.should.be.a("object");
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it("should add a blog post on POST", function() {
    const newItem = {
      title: "New Blog Post",
      content: "Filler paragraph for a test blog post",
      author: "John Doe"
    };
    return chai
      .request(app)
      .post("/blog-posts")
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.include.keys(
          "id",
          "title",
          "content",
          "author",
          "publishDate"
        );
        res.body.id.should.not.be.null;
        res.body.title.should.equal(newItem.title);
        res.body.content.should.equal(newItem.content);
        res.body.author.should.equal(newItem.author);
      });
  });

  it(`Should update blog posts on PUT`, function() {
    const updateData = {
      title: "This is an updated blog post",
      content: "This is a test to update content",
      author: "Updated author"
    };
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        updateData.id = res.body[0].id;
        updateData.publishDate = res.body[0].publishDate;

        return chai
          .request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it(`Should delete blog posts on DELETE`, function() {
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
