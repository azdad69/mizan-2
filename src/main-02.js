import { request } from "./service.js";


async function testerAPI(){
    try {
        const posts = await request("/posts")
    } catch (error) {
        console.log(error);
    }
}
testerAPI();