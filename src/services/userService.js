
const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');

class UserService {
    constructor() {
        this.db = db;
    }

    findAllPlayer = async () => {
        try {
            return await this.db('players').select('*');
        } catch (error) {
            throw errorHandler(503, error.message);
        } 
    }

    findPlayerbyId = async (playerId) => {
        try {
            return await this.db('players')
                            .select('*')
                            .where('id',playerId)
                            .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findPlayerbyEmail = async (playerEmail) => {
        try {
            const user =  await this.db('players')
                            .select('*')
                            .where('email',playerEmail)
                            .first();
            console.log(user);
            return user;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    savePlayer = async (player) => {
        try {
            const {fullName, email, hashedPassword, phoneNumber} = player;
            const newUserId = await this.db('players')
                                        .insert({full_name: fullName, email, password: hashedPassword, phone_number: phoneNumber});
            return newUserId.at(0);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
        
    }

    savePlayerNoPassword = async (player) => {
        try {
            const {fullName, phoneNumber} = player;
            const newUserId = await this.db('players').insert({full_name: fullName, phone_number: phoneNumber});
            return newUserId.at(0);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    updatePlayer = async (playerId, newPlayer) => {
        try {
            const conditions = {};
            console.log(newPlayer);
            newPlayer.fullName && (conditions.full_name = newPlayer.fullName);
            newPlayer.hashedPassword && (conditions.password = newPlayer.hashedPassword);
            newPlayer.phoneNumber && (conditions.phone_number = newPlayer.phoneNumber);

            await this.db('players')
                        .where('id', playerId)
                        .update(conditions)

            return await this.db('players').select('*').where('id', playerId);
        } catch (error) {
            throw errorHandler(503, error.message, error.errors);
        }
    }

    deletePlayer = async (playerId) => {
        try {
            await this.db('players').where('id', playerId).delete();
        } catch (error) {
            throw errorHandler(503, error.message, error.errors);
        }
    }

    ///////////////////////////

    findAllManager = async () => {
        try {
            return await this.db('managers').select('*');    
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findManagerbyId = async (managerId) => {
        try {
            return await this.db('managers')
                            .select('*')
                            .where('id',managerId)
                            .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
        
    }

    findManagerbyEmail = async (managerEmail) => {
        try {
            return await this.db('managers')
                            .select('id')
                            .where('email',managerEmail)
                            .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findStadiumOwner = async (stadiumId) => {
        try {
            const owner = await this.db('managers')
                                        .join('stadiums_managers', 'stadiums_managers.manager_id', 'managers.id')
                                        .select('managers.*')
                                        .where('stadiums_managers.stadium_id', stadiumId)
                                        .where('stadiums_managers.role', 'owner')
                                        .first()

            return owner;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveManager = async (manager) => {
        try {
            const {fullName, email, hashedPassword, phoneNumber} = manager;
            const rows = await this.db('managers')
                                        .insert({full_name: fullName, email, password: hashedPassword, phone_number: phoneNumber});
            const newUserId= rows[0];
            return newUserId
        } catch (error) {
            throw errorHandler(503, error.message);
        }
        
    }


    updateManager = async (manager) => {
        try {
            const managerId = manager.managerId;

            const newManager = {};
            if(manager.fullName) newManager.full_name = manager.fullName;
            if(manager.email) newManager.email = manager.email;
            if(manager.hashedPassword) newManager.password = manager.hashedPassword;
            if(manager.phoneNumber) newManager.phone_number = player.phoneNumber;

            console.log(newManager);
            await this.db('managers')
                        .where('id', managerId)
                        .update(newManager)

            return await this.db('managers').select('*').where('id',managerId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteManager = async (managerId) => {
        try {
            await this.db('managers').where('id', managerId).delete();
        } catch (error) {
            throw errorHandler(503, error.message, error.errors);
        }
    }


    ///////////////////////////


    ///////////////////
    extractUserData(user) {
        const {password, ...newUserData} = user;
        return newUserData;
    }

}

module.exports = new UserService();