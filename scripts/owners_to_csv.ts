const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const fs = require('fs');
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
// make sure to have ethers.js 5.X required, else this will fail!
const BigNumber = ethers.BigNumber;
import { BitArray } from "@ethercards/ec-util";

const zoom_abi = [{"inputs":[{"internalType":"bytes","name":"inputData","type":"bytes"}],"name":"combine","outputs":[{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"}];
import { Zoom } from "zoom-next";

async function main() {

    const owners:any = [];

    interface TkData {
        [key: string]: any
    }
    // const tokenData: TkData = await import('../../data/v2/Processed.json');

    for(let z = 1; z <= 4; z++) {
        const data: TkData = await import('./data/owners_'+z+'.json');
        const keys = Object.keys(data);
        console.log(keys.length);

        keys.forEach((element:any, index: any) => {
            if(element !== "default") {
                owners.push(data[element]);
            }
        });
    }
    

    let token_to_owner = "";
    let distinct_owners:any = [];
    let distinct_owners_csv = "";

    owners.forEach((element:any, index: any) => {
        token_to_owner+=element.id + ", "+element.owner+"\n";

        if(!distinct_owners.includes(element.owner.toString())) {
            distinct_owners.push(element.owner.toString());
            distinct_owners_csv+=element.owner+"\n";
        }
    });

    try {
        fs.writeFileSync('scripts/data/token_to_owner.csv', token_to_owner);
    } catch (err) {
        console.error(err);
    }


    try {
        fs.writeFileSync('scripts/data/distinct_owners.csv', distinct_owners_csv);
    } catch (err) {
        console.error(err);
    }

    try {
        fs.writeFileSync('scripts/data/distinct_owners.json', JSON.stringify(distinct_owners));
    } catch (err) {
        console.error(err);
    }
    

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
