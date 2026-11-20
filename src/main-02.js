import { request } from "./service";
console.log("main2 khdam ");


async function testerAPI(){
    try {
        const posts = await request("/posts")
        console.log(posts)
    } catch (error) {
        console.log(error);
    }
}
testerAPI();