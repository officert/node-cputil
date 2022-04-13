import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'
import nodeHtmlToImage from 'node-html-to-image'

const CPUTIL_PATH =
  process.platform === 'darwin'
    ? path.join(__dirname, './bin/macos/cputil')
    : path.join(__dirname, './bin/linux/cputil')

export enum StarPrinterType {
  THERMAL_2 = 'thermal2',
  THERMAL_3 = 'thermal3',
  THERMAL_4 = 'thermal4',
}

export enum StarContentType {
  STAR_PRNT = 'application/vnd.star.starprnt',
  PNG = 'image/png',
}

/**
 * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
 * @param {String} text
 * @returns {String}
 */
export const convertStarPrintMarkUp = async ({
  text,
  variables,
  printerType,
  contentType,
}: {
  text: string
  variables?: object
  printerType?: StarPrinterType
  contentType?: StarContentType
}) => {
  if (!text) return Promise.reject(new Error('text'))

  const fileName = `tmp-${new Date().getTime()}.png`
  const tmpFilePath = path.join(__dirname, `./tmp/${fileName}`)
  const outputFilePath = path.join(__dirname, `./output/${fileName.replace('.png', '.bin')}`)

  printerType = printerType ?? StarPrinterType.THERMAL_3

  await Promise.all([
    makeDir(path.join(__dirname, './tmp')),
    makeDir(path.join(__dirname, './output')),
  ])

  await nodeHtmlToImage({
    output: tmpFilePath,
    html: text,
    content: variables ?? {},
    type: 'png',
    encoding: 'binary',
  })

  console.log('TEMP FILE PATH', tmpFilePath)

  await execCputil({
    printerType,
    contentType: contentType ?? StarContentType.STAR_PRNT,
    tmpFilePath,
    outputFilePath,
  })

  const fileBuffer = await readFile(tmpFilePath)

  // await Promise.all([
  //   deleteFile(tmpFilePath), deleteFile(outputFilePath)
  // ])

  return fileBuffer.toString()
}

async function readFile(filename: string): Promise<string> {
  if (!filename) return Promise.reject(new Error('filename'))

  return new Promise((resolve, reject) => {
    fs.readFile(
      filename,
      {
        encoding: 'utf-8',
      },
      (err, result) => {
        if (err) return reject(err)

        return resolve(result)
      }
    )
  })
}

// async function writeFile(filename: string, data: string) {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(
//       filename,
//       data,
//       {
//         encoding: 'utf-8',
//       },
//       (err: any) => {
//         if (err) return reject(err)

//         return resolve(null)
//       }
//     )
//   })
// }

function deleteFile(filename: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, (err: any) => {
      if (err) return reject(err)

      return resolve(null)
    })
  })
}

async function execCputil({
  printerType,
  contentType,
  tmpFilePath,
  outputFilePath,
}: {
  printerType: StarPrinterType
  contentType: StarContentType
  tmpFilePath: string
  outputFilePath: string
}) {
  const args = [
    printerType,
    'dither',
    'scale-to-fit',
    'decode',
    contentType,
    tmpFilePath,
    outputFilePath,
  ]

  console.log('CPUTIL ARGS', args)

  return new Promise((resolve, reject) => {
    child_process.execFile(CPUTIL_PATH, args, (error?: any, stdout?: any, stderr?: any) => {
      if (error) {
        return reject(error)
      }

      if (stderr) {
        return resolve(stderr)
      }

      return resolve(stdout)
    })
  })
}

function makeDir(path: string) {
  return checkIfDirAlreadyExists(path).then((exists) => {
    if (!exists) return createDir(path)
  })
}

function createDir(path: string) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) {
        return reject(err)
      }

      return resolve(null)
    })
  })
}

function checkIfDirAlreadyExists(path: string) {
  return new Promise((resolve) => {
    fs.access(path, (error) => {
      if (error) {
        return resolve(false)
      }

      return resolve(true)
    })
  })
}
