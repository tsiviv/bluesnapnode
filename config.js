
const API_USERNAME = 'API_17193957133152076686385';
const API_PASSWORD = 'P@ssword_Example1';
const encodedCredentials = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');

// הגדרת הכותרות עבור קריאת ה-API
module.exports = {
     headersXML :{
        'User-Agent': 'MyBlueSnapApp/1.0',  // Use a generic name and version number
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
    },
     headers : {
        'User-Agent': 'MyBlueSnapApp/1.0',  // Use a generic name and version number
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

}