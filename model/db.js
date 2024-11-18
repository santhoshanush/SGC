const db = (username,pass,dbname) => {
   return `mongodb+srv://${username}:${pass}@YourClustername.bnvaq.mongodb.net/${dbname}?retryWrites=true&w=majority`;
};

module.exports = db;
