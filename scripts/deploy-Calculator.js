const chalk = require('chalk');
const hre = require('hardhat')
const fsPromises = require('fs/promises');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Optionnel car l'account deployer est utilisé par défaut
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // Calculator deployment
  const Calculator = await hre.ethers.getContractFactory('Calculator')
  const calculator = await Calculator.deploy("0x51e0F30A89332aCF8BC3DC2E8FA169E8D13Dc643")

  await calculator.deployed()

  console.log(chalk.green('success'),'Calculator deployed to:', calculator.address, "\n")

  const keyAddress = 'address';
  const keyNetwork = hre.network.name;
  const addressJSON = {};
  const networkJSON = {};
  addressJSON[keyAddress] = calculator.address;
  networkJSON[keyNetwork] = addressJSON;

  let deployedJSON = {
    Calculator : calculatorJSON
  }

  try{
  await fsPromises.writeFile('./deployed-calculator.json' ,JSON.stringify(deployedJSON))
  } catch (e) {
    console.log(e.message)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
