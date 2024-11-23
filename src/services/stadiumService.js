const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');

class StadiumService {
    constructor() {
        this.db = db;
    }

    findAll = async () => {
        try {
            return await this.db('stadiums').select('*');
        } catch (error) {
            throw errorHandler(503, error.message);            
        }
    }

    findById = async (stadiumId) => {
        try {
            return await this.db('stadiums').select('*').where('id', stadiumId).first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByMangerId = async (managerId) => {
        try {
            const stadiums = await this.db('stadiums_managers')
                                        .join('stadiums', 'stadiums_managers.stadium_id', 'stadiums.id')
                                        .select('stadiums.*')
                                        .where('stadiums_managers.manager_id', managerId);
            return stadiums;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findOwnerById = async (stadiumId) => {
        try {
            // return owner Id
            return await this.db('stadiums_managers')
                                .select('manager_id')
                                .where('stadiums_managers.stadium_id', stadiumId)
                                .where('stadiums_managers.role', 'owner')
                                .first();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findStaffById = async (stadiumId) => {
        try {
            // return staff ids
            const staffs = await this.db('stadiums_managers')
                                        .select('manager_id')
                                        .where('stadiums_managers.stadium_id', stadiumId)
                                        .where('stadiums_managers.role', 'staff');
            return staffs;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findManagerById = async (stadiumId) => {
        try {
            // return manager id
            const managers = await this.db('stadiums_managers')
                                        .select('manager_id')
                                        .where('stadiums_managers.stadium_id', stadiumId)
            return managers;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    saveStadium = async (stadium) => {
        try {
            const newStadiumId = await this.db('stadiums').insert(stadium);
            return newStadiumId;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    // delete old owner and inser new owner
    assignOwner = async (stadiumId, ownerId) => {
        try {
            await this.db('stadiums_managers').where({stadium_id: stadiumId, role: 'owner'}).delete();
            await this.db('stadiums_managers').insert({stadium_id: stadiumId, manager_id: ownerId, role: 'owner'});
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    addStaff = async (stadiumId, staffId) => {
        try {
            await this.db('stadiums_managers').insert({stadium_id: stadiumId, manager_id: staffId, role: 'staff'});
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    removeStaff = async (stadiumId, staffId) => {
        try {
            await this.db('stadiums_managers')
                        .where({stadium_id: stadiumId, manager_id: staffId})
                        .delete();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteStadium = async (stadiumId) => {
        try {
            await this.db('stadiums').where('id', stadiumId).delete();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    update = async (stadiumId, newStadium) => {
        try {
            await this.db('stadiums').where('id', stadiumId).update(newStadium);
            return await this.findById(stadiumId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    
}

module.exports = new StadiumService();