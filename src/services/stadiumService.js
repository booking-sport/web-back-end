const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');
const commentService = require('./commentService');
const userService = require('./userService');

class StadiumService {
    constructor() {
        this.db = db;
    }

    findAll = async () => {
        try {
            const records = await this.db('stadiums').select('*');
            const images = await this.findImagesByAllStadium();
            const stadiums = records.map((record) => {
                const imageStadium = images[record.id] ? images[record.id] : [];
                return {...record, "images": imageStadium};
            });
            return stadiums;
        } catch (error) {
            throw errorHandler(503, error.message);            
        }
    }

    findById = async (stadiumId) => {
        try {
            const basicInfo = await this.db('stadiums').select('*').where('id', stadiumId).first();
            const images = await this.findImagesByStadiumId(stadiumId);
            const owner = await userService.findStadiumOwner(stadiumId);
            const ratings = await commentService.countRatingForStadium(stadiumId);
            return {...basicInfo, images, ratings, owner};
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findImagesByStadiumId = async (stadiumId) => {
        try {
            const rows = await this.db('stadiums_images')
                                        .select('image_path')
                                        .where('stadium_id', stadiumId)
            const images = rows.map((ele) => ele.image_path);
            return images;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findImagesByAllStadium = async () => {
        try {
            const rows = await this.db('stadiums_images').select('*');

            const images = rows.reduce( (arr,row) => {
                const stadiumId = row.stadium_id;
                if(!arr[stadiumId]) arr[stadiumId] = [];
                arr[stadiumId].push(row.image_path);
                return arr;
            }, {});

            return images;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByMangerId = async (managerId) => {
        try {
            const records = await this.db('stadiums_managers')
                                        .join('stadiums', 'stadiums_managers.stadium_id', 'stadiums.id')
                                        .select('stadiums.*')
                                        .where('stadiums_managers.manager_id', managerId);
            
            const images = await this.findImagesByAllStadium();
            const stadiums = records.map((record) => {
                const imageStadium = images[record.id] ? images[record.id] : [];
                return {...record, "images": imageStadium};
            });
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

    findFieldsByStadiumId = async (stadiumId) => {
        try {
            const fields = await this.db('fields').select('*').where('stadium_id', stadiumId);
            return fields;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    saveStadium = async (stadium) => {
        try {
            const {images, ...record} = stadium;
            const newRecords = await this.db('stadiums').insert(record);
            const newStadiumId = newRecords.at(0);
            if(images && images.length > 0) await this.saveStadiumImages(images, newStadiumId);
            return newStadiumId
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveStadiumImages = async (images, stadiumId) => {
        try {
            let records = [];
            records = images.map((url) => {
                return {
                    image_path: url,
                    stadium_id: stadiumId
                }
            });

            await this.db('stadiums_images').insert(records);
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