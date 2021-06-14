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

  // SarahRo deployment
  const SarahRo = await hre.ethers.getContractFactory('SarahRo')
  const sarahro = await SarahRo.deploy()

  // Attendre que le contrat soit réellement déployé, cad que la transaction de déploiement
  // soit incluse dans un bloc
  await sarahro.deployed()
  console.log(chalk.green('success'),'SarahRo deployed to:', sarahro.address, "\n")

  const keyAddress = 'address';
  const keyNetwork = hre.network.name;
  const addressJSON = {};
  const networkJSON = {};
  addressJSON[keyAddress] = sarahro.address;
  networkJSON[keyNetwork] = addressJSON;

  let deployedJSON = {
    SarahRo : sarahroJSON
  }

  try{
  await fsPromises.writeFile('./deployed-sarahro.json' ,JSON.stringify(deployedJSON))
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
