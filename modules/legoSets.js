require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
      }
  });

  

  const Theme = sequelize.define('Theme', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, {
    createdAt: false,
    updatedAt: false,
  });

  const Set = sequelize.define('Set', {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    year: {
      type: Sequelize.INTEGER
    },
    num_parts: {
      type: Sequelize.INTEGER
    },
    theme_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Themes', // Note: 'Themes' is the table name that Sequelize infers from the model name
        key: 'id'
      }
    },
    img_url: {
      type: Sequelize.STRING
    }
  }, {
    createdAt: false,
    updatedAt: false,
  });
  
Set.belongsTo(Theme, {foreignKey: 'theme_id'})


function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch((err) => {
            reject("Unable to sync with the database: " + err);
        });
    });
}

function getAllSets() {
    return new Promise((resolve, reject) => {
        Set.findAll({
            include: [Theme]
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("Error fetching all sets: " + err);
        });
    });
}

function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        Set.findAll({
            where: { set_num: setNum },
            include: [Theme]
        }).then(data => {
            if (data.length > 0) resolve(data[0]);
            else reject("Set not found");
        }).catch(err => {
            reject("Error fetching set: " + err);
        });
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        Set.findAll({
            include: [{
                model: Theme,
                where: {
                    name: {
                        [Sequelize.Op.iLike]: `%${theme}%`
                    }
                }
            }]
        }).then(data => {
            if (data.length > 0) resolve(data);
            else reject("No sets found for the theme");
        }).catch(err => {
            reject("Error fetching sets by theme: " + err);
        });
    });
}

function addSet(setData) {
    return new Promise((resolve, reject) => {
        Set.create(setData).then(() => {
            resolve();
        }).catch((err) => {
            reject("Error adding new set: " + err);
        });
    });
}
function getAllThemes() {
    return new Promise((resolve, reject) => {
        Theme.findAll().then(themes => {
            resolve(themes);
        }).catch((err) => {
            reject("Error fetching themes: " + err);
        });
    });
}
function updateSet(setNum, setData) {
    return new Promise((resolve, reject) => {
        Set.update(setData, {
            where: { set_num: setNum }
        })
        .then(() => resolve())
        .catch(err => reject(err));
    });
}
function deleteSet(setNum) {
    return new Promise((resolve, reject) => {
        Set.destroy({
            where: { set_num: setNum }
        }).then(() => {
            resolve();
        }).catch(err => {
            reject(err.errors[0].message);
        });
    });
}
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    addSet,
    getAllThemes,
    updateSet,
    deleteSet
};

