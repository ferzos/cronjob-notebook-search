const env = require('dotenv').config()
const axios = require('axios');
const fs = require('fs');

const prefix = 'https://api.mlab.com/api/1';
const API_KEY = process.env.API_KEY;
axios.defaults.headers.post['Content-Type'] = 'application/json';
const set = new Set();

function createNotebook(name) {
  const notebook = new Object();
  notebook.name = name;
  return notebook;
}

function createListOfNotebook() {
  const enterKomputerApi = 'https://enterkomputer.com/api/product/notebook.json';
  
  axios.get(enterKomputerApi)
  .then(function(response) {
    const data = response.data;
    let outputString = '';
    let outputString2 = '';

    let notebookName = '';
    let notebookDetails = '';
    let notebookBrand = '';
    let notebookSubcategoryDescription = '';
    let notebookPrice = '';
    let notebookQuantity = '';
    
    data.map(notebook => {
      if (notebook.subcategory_description != 'Notebook LED Panel' &&
          notebook.subcategory_description != 'Notebook Keyboard' &&
          notebook.subcategory_description != 'Notebook Bag' &&
          notebook.subcategory_description != 'Notebook Accessories' &&
          notebook.subcategory_description != 'Notebook Battery' && 
          notebook.subcategory_description != 'Security Cable Lock' &&
          notebook.subcategory_description != 'Notebook Adaptor' &&
          notebook.subcategory_description != 'Notebook Cooler' &&
          notebook.subcategory_description != 'Apple Cable / Connector' &&
          notebook.subcategory_description != '') {
            
            notebookName = notebook.name;
            notebookName = cleanName(notebookName);
            
            // TO BE PARSE LATER
            notebookDetails = notebookDetailsParse(notebook.details);

            notebookBrand = notebook.brand_description

            // TO BE ANALYZED
            notebookSubcategoryDescription = notebook.subcategory_description;

            notebookPrice = notebook.price;
            notebookQuantity = notebook.quantity;
            
            outputString  += `${notebookDetails}\n`;
            outputString2 += `${notebookName}\n`;
      }
    });
    fs.writeFile('out.txt', outputString, (err) => {  
      // throws an error, you could also catch it here
      if (err) throw err;
  
      // success case, the file was saved
      console.log('Done!');
    });
    fs.writeFile('out_name.txt', outputString2, (err) => {  
      // throws an error, you could also catch it here
      if (err) throw err;
  
      // success case, the file was saved
      console.log('Done!');
    });
    console.log(set.size);
  });
}

function cleanName(name) {
  let notebookName = name;
  notebookName = notebookName.replace(/\s-\sAsk Us For Discount/g, '');
  notebookName = notebookName.replace(/\sAsk Us For Discount/g, '');
  notebookName = notebookName.replace(/\s-\sNew!!!/g, '');
  notebookName = notebookName.replace(/\s-\sGaransi Distributor/g, '');
  
  return notebookName;
}

function notebookDetailsParse(details) {
  const notebookDetails = details.split(',');
  const detail = new Object();

  detail.details = details;
  detail.processor = parsingProcessor(notebookDetails[0]);

  

  if (notebookDetails[1]) {
    detail.ram = notebookDetails[1].trim();
  }

  return detail.processor;
}

function parsingProcessor(data) {
  let processor = '';
  // PARSING PROCESSOR
  if (data) {
    const splitProcessorString = data.split('/')
    // String processor yang salah
    if (splitProcessorString[1]) {
      processor = splitProcessorString[0].trim();
    } 
    // String processor yang benar
    else {
      processor = data.trim();
    }

    // Parsing buat intel
    if (data.match(/intel/gi)) {
      if (data.match(/i3/gi)) {
        processor = 'Intel i3';
      } else if (data.match(/i5/gi)){
        processor = 'Intel i5';
      } else if (data.match(/i7/gi)){
        processor = 'Intel i7';
      }
    }

    // Parsing buat amd
    if (data.match(/amd/gi)) {
      processor = 'AMD';
    }
  }

  return processor;
}

function insertToDB(data) {
  const url = `https://api.mlab.com/api/1/databases/notebook-search/collections/notebook?apiKey=${API_KEY}`
  
  axios.post(url, JSON.stringify(data))
  .then(function (response) {
    console.log(`${response.status} ${response.statusText}`);
  })
  .catch(function (error) {
    console.log(error);
  });
}

function main() {
  // insertToDB([createNotebook("Apple Macbook Pro"), createNotebook("Apple Macbook Pro"), createNotebook("Apple Macbook Pro")]);
  createListOfNotebook();
}

main();



