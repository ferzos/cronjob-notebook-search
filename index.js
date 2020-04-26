require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.API_KEY;
axios.defaults.headers.post['Content-Type'] = 'application/json';

function createListOfNotebook() {
  const enterKomputerApi = 'https://enterkomputer.com/api/product/notebook.json';
  const arrayNotebook = new Array();

  axios.get(enterKomputerApi)
    .then(function (response) {
      const data = response.data;

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
          parseInt(notebook.price) > 2000000 &&
          notebook.details != ' ' &&
          notebook.details != '') {

          let notebookObj = new Object();

          notebookObj.name = cleanName(notebook.name);

          notebookObj.details = notebookDetailsParse(notebook.details);

          notebookObj.brand = notebook.brand_description

          notebookObj.price = parseInt(notebook.price);

          arrayNotebook.push(notebookObj);
        }
      });

      insertToDB(arrayNotebook);
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

  // String rusak
  if (notebookDetails[0].match(/\//g) && !notebookDetails[0].match(/\/13/g)) {
    const arrData = notebookDetails[0].split('/')
    detail.processor = parsingProcessor(arrData[0]);
    detail.ram = parsingRam(arrData[1]);
    detail.storage = parsingStorage(arrData[2]);
    detail.vga = parsingVGA(details);
    detail.ssd = details.toLowerCase().match(/ssd/g) ? true : false;
  }
  // String bagus
  else {
    detail.processor = parsingProcessor(notebookDetails[0]);
    detail.ram = parsingRam(notebookDetails[1]);
    detail.storage = parsingStorage(notebookDetails[2]);
    detail.vga = parsingVGA(details);
    detail.ssd = details.toLowerCase().match(/ssd/g);
    detail.ssd = details.toLowerCase().match(/ssd/g) ? true : false;
  }

  return detail;
}

function parsingVGA(oldDetails) {
  const details = oldDetails.toLowerCase();
  let vga = new Object();

  // Kalo ada word 'Radeon'
  if (details.match(/radeon/g)) {
    vga.brand = 'amd'
    // R5, R6, R7, R8, 
    if (details.match(/r5/g)) {
      vga.version = 'r5'
    } else if (details.match(/r6/g)) {
      vga.version = 'r6'
    } else if (details.match(/r7/g)) {
      vga.version = 'r7'
    } else if (details.match(/r8/g)) {
      vga.version = 'r8'
    }
  }
  // Kalo ada word 'Nvidia'
  else if (details.match(/nvidia/g)) {
    vga.brand = 'nvidia'
    // GT, GTX
    if (details.match(/gtx/g)) {
      vga.version = 'gtx'
    } else if (details.match(/gt/g)) {
      vga.version = 'gt'
    }
  }

  return vga;
}

function parsingProcessor(data) {
  let processor = '';

  // PARSING PROCESSOR
  if (data) {
    processor = data.trim();

    // Parsing buat intel
    if (processor.match(/intel/gi)) {
      if (processor.match(/i3/gi)) {
        processor = 'i3';
      } else if (processor.match(/i5/gi)) {
        processor = 'i5';
      } else if (processor.match(/i7/gi)) {
        processor = 'i7';
      } else if (processor.match(/i9/gi)) {
        processor = 'i9'
      }
    }

    // Parsing buat amd
    if (processor.match(/amd/gi)) {
      processor = 'amd';
    }
  }

  return processor;
}

function parsingRam(data) {
  let ram = '';

  if (data) {
    ram = data.trim();

    if (ram.match(/2GB/gi)) {
      ram = '2';
    } else if (ram.match(/4GB/gi)) {
      ram = '4';
    } else if (ram.match(/8GB/gi)) {
      ram = '8';
    } else if (ram.match(/16GB/gi)) {
      ram = '16';
    }
  }

  return ram;
}

function parsingStorage(data) {
  let storage = '';

  if (data) {
    storage = data.trim();

    if (storage.match(/256GB/gi)) {
      storage = '256';
    } else if (storage.match(/512GB/gi) || storage.match(/500GB/gi)) {
      storage = '512';
    } else if (storage.match(/1TB/gi)) {
      storage = '1000';
    } else if (storage.match(/2TB/gi)) {
      storage = '2000';
    }
  }

  return storage;
}

function insertToDB(data) {
  const url = `https://api.mlab.com/api/1/databases/notebook-search/collections/notebook?apiKey=${API_KEY}`

  axios
    .put(url, JSON.stringify([]), {
      headers: {
        'Content-type': 'application/json;charset=utf-8'
      }
    })
    .then(function (_) {
      console.log('Success clean documents')
      axios
        .post(url, JSON.stringify(data))
        .then(function (response) {
          console.log(`Success insert data. Status ${response.statusText}`);
        })
        .catch(function (error) {
          console.log(`failed to insert data to db. ${error}`);
        });
    })
    .catch(function (error) {
      console.log(`failed to delete documents. ${error}`)
    })
}

function main() {
  createListOfNotebook();
}

main();



