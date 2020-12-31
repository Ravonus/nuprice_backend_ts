import { Server, Socket } from "socket.io";

module.exports = (io: Server, client: Socket) => {
  return client.on("nuprice", (data) => {
    switch (data.type) {
      case "priceChange":
        break;

      case "inventory":
        client.to(client.id).emit("nuprice", data);
        break;

      case "inventoryCombine":
        client.to(client.id).emit("nuprice", data);
        break;

      case "updatePricePush":
        data.type = "updatePrice";

        client.to(client.id).emit("nuprice", data);
        break;

      case "filterUpdate":
        client.to(data.id).emit("nuprice", data);
        break;

      default:
        //   io.to(data.id).emit('nuprice', 'cook');
        client.to(data.id).emit("nuprice", data);

        break;
    }
  });
};
