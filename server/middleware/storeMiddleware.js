

const storeMiddleware = async (req, res, next) => {
  try {
    let admin = req?.user?.role;
    if (admin!=='store') {
      return res.status(400).send({
        msg: "Unauthorized, you are not store Admin",
        src: "storeMiddleware",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ msg: "storeMiddleware", error });
  }
};

module.exports = storeMiddleware;