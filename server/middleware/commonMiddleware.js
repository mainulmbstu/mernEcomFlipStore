

const commonMiddleware = async (req, res, next) => {
  try {
    let admin = req?.user?.role;
    if (admin==='admin' || admin ==='store') {
      next()
    } else {
      return res.status(400).send({
        msg: "Unauthorized, you are not an Admin",
        src: "commonMiddleware",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "commonMiddleware", error });
  }
};

module.exports = commonMiddleware;