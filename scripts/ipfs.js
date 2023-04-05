const { create, globSource } = require('ipfs-http-client')
async function uploadDirToIpfs({ dirPath, ipfsApiUrl, ignore, progress }) {
  console.log(dirPath)
  const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: 'Basic ' + Buffer.from('2NGyTyKvI09iumogfsWDGNUPRVi:54e3483fa43f3614dc77af9d4a6cc192').toString('base64')
    }
  })

  const root = await ipfs.add(globSource(dirPath, { recursive: true }))

  return root.cid.toString()
}

module.exports = uploadDirToIpfs
