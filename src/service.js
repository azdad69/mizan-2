const BASE_URL =  "https://jsonplaceholder.typicode.com";

async function request(path, options = {}) {
    const url = BASE_URL + path;
    const controller = new AbortController();
const timeoutID = setTimeout(() =>{
    controller.abort()
},8000);
try{
    const response = await fetch(url, {
        ...options,
         signal: controller.signal,
         headers:{
            "Content-Type" : "application/json",
            "Accept" : "application/json",
            ...options.headers
         }
        })
        if (!response.ok){
        const error =  new Error("Erreur HTTP");
        error.type = "http";
        error.status = response.status;
        throw error;
    }
    const data = await response.json()
    return data
    }catch (error){
        if(error.name === "AbortError"){
           const timeoutError = new Error("Timeout aprés 8secondes")
           timeoutError.type = "timeout"
           timeoutError.status = null
           throw timeoutError;
        }if(error instanceof TypeError){
const networkError = new Error("Erreur de connexion")
    networkError.type = navigator.onLine ? "network" : "offline"
    networkError.status = null ; 
    throw networkError;
        }if(error instanceof SyntaxError){
            const parseError  = new Error("Erreur lors du parsing JSON")
            parseError.type = "parse";
            parseError.status = null;
            throw parseError;
        }
         throw error;
}finally{
    clearTimeout(timeoutID)
}
}
export {request};