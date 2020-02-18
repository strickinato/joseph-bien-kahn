const fs = require('fs');
const readline = require('readline');
const dateformat = require('dateformat')
const {google} = require('googleapis');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const SPREADSHEET_ID = '1kpsqqVU6Gmyytme33IL7LIoFpj0MixK9jtW2hq2P2FU'

const sheets = google.sheets({
    version: 'v4',
    auth: GOOGLE_API_KEY,
})

const getData = () => {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A2:D',
        }, (err, response) => {
            if (err) {
                reject(new Error('The API returned an error: ' + err));
            }

            resolve(response.data.values)
        })
    })
}

const rowToStructure = (row) => {
    const date = new Date(row[2])

    return {
        publication: row[0],
        headline: row[1],
        date: dateformat(date, "mmm. d, yyyy"),
        link: row[3],
    }
}

const writeToFile = (data) => {
    const jsonContent = JSON.stringify(data)

    return new Promise((resolve, reject) => {
        fs.writeFile("src/links.json", jsonContent, 'utf8', function (err) {
            if (err) {
                reject(new Error('Couldnt write to disk: ' + err));
            }

            resolve(jsonContent)
        })
    })
}

const main = async () => {
    const responseData = await getData()
    const structuredData = responseData.map(rowToStructure)
    const writtenData =  await writeToFile(structuredData)

    return writtenData
}


main()
    .then(a => console.log(a) )
    .catch(err => console.log(err) )
