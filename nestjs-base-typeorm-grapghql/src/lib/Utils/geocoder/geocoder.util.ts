import NodeGeocoder from "node-geocoder";

export const GeoLocator = async (Address: any) => {
  const street = Address.street || " ";
  const area = Address.area || " ";
  const city = Address.city || " ";
  const zip = Address.zip || "";
  const country = Address.country || " ";
  const fullAdress = `${street} ${area} ${city} ${zip} ${country}`;
  const options: any = {
    provider: "google",
    apiKey: process.env.GEOCODER_MAP_KEY,
  };
  const geocoder: any = NodeGeocoder(options);
  const result = await geocoder.geocode(fullAdress, (err: any, res: any) => {
    if (err) {
      console.log(err);
    }
    return res;
  });
  const latlong = {
    latitude: result[0].latitude,
    longitude: result[0].longitude,
  };

  return latlong;
};
