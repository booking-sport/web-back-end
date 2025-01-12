const db = require("../config/dbConfig");
const { errorHandler } = require("../helpers/errorHandler");
const stadiumService = require("./stadiumService");

class OrderService {
  constructor() {
    this.db = db;
  }

  findAll = async () => {
    try {
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id");
      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findOneOrder = async (orderId) => {
    try {
      const order = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id")
        .where("order_details.id", orderId)
        .first();
      return order;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findOneBigOrder = async (orderId) => {
    try {
      const order = await this.db("orders")
        .select("*")
        .where("id", orderId)
        .first();
      return order;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findByOneStadium = async (stadiumId, date) => {
    try {
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id")
        .where("orders.stadium_id", stadiumId)
        .where((query) => {
          if (date) query.where("order_details.date", date);
        });

      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findByOnePlayer = async (playerId, date) => {
    try {
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select(
          "order_details.*",
          "orders.stadium_id",
          "orders.player_id",
          "orders.note",
          "orders.full_name",
          "orders.phone_number"
        )
        .where("orders.player_id", playerId)
        .where((query) => {
          if (date) query.where("order_details.date", date);
        });
      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findOrderToday = async (stadiumId, date) => {
    try {
      console.log(stadiumId, date);
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id")
        .where("orders.stadium_id", stadiumId)
        .where("order_details.date", date);

      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findOrderSuccessToday = async (stadiumId, date) => {
    try {
      console.log(stadiumId, date);
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id")
        .where("orders.stadium_id", stadiumId)
        .where("order_details.date", date)
        .where("order_details.order_status", "success");

      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findByListStadium = async (stadiumIds) => {
    try {
      const orders = await this.db("order_details")
        .join("orders", "order_details.order_id", "orders.id")
        .select("order_details.*", "orders.stadium_id", "orders.player_id")
        .whereIn("orders.stadium_id", stadiumIds);

      return orders;
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  findSelfOrdersByManager = async (managerId) => {
    try {
      const stadiums = await stadiumService.findByMangerId(managerId);
      const stadimIds = stadiums.map((ele) => ele.id);
      return await this.findByListStadium(stadimIds);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  countOrdersByMonth = async () => {
    try {
      const records = await this.db("order_details")
        .select(
          this.db.raw("YEAR(created_at) AS year"),
          this.db.raw("MONTH(created_at) AS month"),
          this.db.raw("COUNT(*) AS count")
        )
        .groupByRaw("YEAR(created_at), MONTH(created_at)")
        .orderBy(["year", "month"]);
      let total = 0;
      if (records && records.length > 0) {
        total = records.reduce((pre, ele) => {
          return pre + ele.count;
        }, 0);
      }

      const groupOrderStatus = await this.db("order_details")
        .select("order_status", this.db.raw("COUNT(*) AS count"))
        .groupBy("order_status")
        .orderBy("order_status");
      return {
        total,
        count_status: groupOrderStatus,
        details: records,
      };
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  saveOrder = async (order) => {
    try {
      const orderId = await this.db("orders").insert(order);
      return orderId.at(0);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  updateBigOrder = async (orderId, newOrder) => {
    try {
      await this.db("orders").where("id", orderId).update(newOrder);
      return await this.findOneBigOrder(orderId);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  saveOrderWithDetails = async (order, ordersToSave) => {
    const trx = await this.db.transaction();

    try {
      const [orderId] = await trx("orders").insert(order);

      const ordersWithOrderId = ordersToSave.map((orderDetail) => ({
        ...orderDetail,
        order_id: orderId,
      }));

      const orderDetailsIds = await trx("order_details").insert(
        ordersWithOrderId
      );
      await trx.commit();

      return {
        orderId,
        orderDetailsIds, // Array of IDs for the inserted order details
      };
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw errorHandler(503, error.message);
    }
  };

  saveOrderDetails = async (orderDetails) => {
    try {
      const orderDetailsId = await this.db("order_details").insert(
        orderDetails
      );
      return orderDetailsId.at(0);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  updateOrder = async (orderId, newOrder) => {
    try {
      await this.db("order_details").where("id", orderId).update(newOrder);
      return await this.findOneOrder(orderId);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  updateOrderDetailsFromBigOrder = async (orderId, condition) => {
    try {
      await this.db("order_details")
        .where("order_id", orderId)
        .update(condition);
      return await this.findOneOrder(orderId);
    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };

  //not order but i write here
  getSubscriptionByMonth = async () => {
    try {
      const subscriptions = await this.db("subscription").select(
        "stadium_id",
        "price",
        "startDate",
        "endDate"
      );

      const revenueByMonth = {};

      for (const subscription of subscriptions) {
        const { startDate, endDate, price } = subscription;

        // Convert startDate and endDate to actual Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Iterate through each month between startDate and endDate
        let currentMonth = start.getMonth() + 1; // months are 0-based, so add 1
        let currentYear = start.getFullYear();

        while (
          currentYear < end.getFullYear() ||
          (currentYear === end.getFullYear() &&
            currentMonth <= end.getMonth() + 1)
        ) {
          const key = `${currentYear}-${currentMonth
            .toString()
            .padStart(2, "0")}`;

          // Accumulate the price for the current month
          if (revenueByMonth[key]) {
            revenueByMonth[key] += price;
          } else {
            revenueByMonth[key] = price;
          }

          // Move to the next month
          currentMonth++;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }
      }

      // Format result in the required output format
      const result = Object.keys(revenueByMonth)
        .map((key) => {
          const [year, month] = key.split("-");
          return {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
            revenue: revenueByMonth[key],
          };
        })
        .sort((a, b) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        );

      console.log(result);
      return result;

    } catch (error) {
      throw errorHandler(503, error.message);
    }
  };
}

module.exports = new OrderService();
