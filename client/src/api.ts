import axios from "axios";

export const URL = `https://startoryx.live/`;

export default axios.create({
    baseURL: baseURL + 'api/',
});