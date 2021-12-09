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
import NFTABI from "./721abi";
const zoom_abi = [{"inputs":[{"internalType":"bytes","name":"inputData","type":"bytes"}],"name":"combine","outputs":[{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"}];
import { Zoom } from "zoom-next";

async function main() {

    const accounts = await ethers.getSigners();
    console.log("    Deployer                     ", accounts[0].address);

    const zoom_contract = new ethers.Contract( "0x7cdF091AF6a9ED75E3192500d3e5BB0f63e22Dea", zoom_abi, accounts[0] );

    const contractAddress = "0xaf89C5E115Ab3437fC965224D317d09faa66ee3E";
    // NFTABI
    const Token = new ethers.Contract(contractAddress, NFTABI, accounts[0]);

    const ZoomLibraryInstance = new Zoom();

    let callCount = 0;
    const perCall = 1000;
    const max = 4000;

    for(let z = 0; z < max / perCall; z++) {

        let owners = [];

        let callNum = 0;
        const item_identifiers = [];

        for(let i = 1; i <= perCall; i++) {
            const tokenId = i + callCount * perCall;

            item_identifiers.push(
                ZoomLibraryInstance.addCall(
                    Token,
                    ["ownerOf(uint256)", [tokenId]],
                    "ownerOf(uint256) returns (address)"
                )
            );
            callNum++;
        }

        const ZoomQueryBinary = ZoomLibraryInstance.getZoomCall();
        const combinedResult = await zoom_contract.combine( ZoomQueryBinary );
        ZoomLibraryInstance.resultsToCache( combinedResult, ZoomQueryBinary );

        let decodedCallNum = 0;

        for(let i = 1; i <= perCall; i++) {
            const tokenId = i + callCount * perCall;

            try {
                const data = ZoomLibraryInstance.decodeCall(
                    item_identifiers[decodedCallNum++]
                )
                console.log(tokenId, "owner", data);

                owners.push({
                    id: tokenId,
                    owner: data
                });

            } catch(e) {
                console.log(tokenId, "token does not exist");
            }
            callNum++;
        }

        callCount++;

        try {
            fs.writeFileSync('scripts/data/owners_'+callCount+'.json', JSON.stringify(owners));
            
            //file written successfully
        } catch (err) {
            console.error(err);
        }
    }

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
