import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'
import { v4 as uuidv4 } from 'uuid'

// console.log('**PRINTER - PLATFORM**', process.platform)

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
  STAR_VND_PRNT = 'application/vnd.star.starprnt',
  STAR_VND_LINE = 'application/vnd.star.line',
}

/**
 * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
 * @param {String} text
 * @returns {String}
 */
export const convertStarPrintMarkUp = async ({
  text,
  printerType,
  contentType,
}: {
  text: string
  printerType?: StarPrinterType
  contentType?: StarContentType
}) => {
  if (!text) return Promise.reject(new Error('text'))

  const fileName = `html-${uuidv4()}.stm`
  const tmpFilePath = path.join(__dirname, `./tmp/${fileName}`)
  // const outputFilePath = path.join(
  //   __dirname,
  //   `./output/${fileName.replace('.stm', '.bin')}`
  // )

  const outputFormat = contentType ?? StarContentType.STAR_VND_PRNT

  printerType = printerType ?? StarPrinterType.THERMAL_3

  // const cmd = `${CPUTIL_PATH} ${printerType} scale-to-fit decode ${outputFormat} ${tmpFilePath} [stdout]`

  await Promise.all([
    makeDir(path.join(__dirname, './tmp')),
    makeDir(path.join(__dirname, './output')),
  ])

  await writeFile(tmpFilePath, text)

  // await execCputil(cmd)

  const results = await asyncExec(CPUTIL_PATH, [
    printerType,
    'scale-to-fit',
    'decode',
    outputFormat,
    tmpFilePath,
    '[stdout]',
  ])

  console.log('CPUTIL RESULTS', results)

  // const results = (await readFile(outputFilePath)) as any

  try {
    await Promise.all([
      deleteFile(tmpFilePath),
      //deleteFile(outputFilePath)
    ])
  } catch (error) {
    console.log('Error deleting files', error)
  }

  return results
}

async function readFile(filename: string) {
  if (!filename) return Promise.reject(new Error('filename'))

  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, result) => {
      if (err) return reject(err)

      return resolve(result)
    })
  })
}

function asyncExec(cmd: string, args?: string[]) {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(cmd, args, {
      env: {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT: 'false',
      },
    })
    const stdout: any[] = []

    process.stdout.on('data', (data) => {
      stdout.push(data)
    })

    process.on('error', (e) => {
      reject(e)
    })

    process.on('close', () => {
      resolve(Buffer.concat(stdout))
    })
  })
}

async function writeFile(filename: string, data: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filename,
      data,
      {
        flag: 'w+',
        encoding: 'utf-8',
      },
      (err: any) => {
        if (err) return reject(err)

        return resolve(null)
      }
    )
  })
}

function deleteFile(filename: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, (err: any) => {
      if (err) return reject(err)

      return resolve(null)
    })
  })
}

// async function execCputil(command: string) {
//   return new Promise((resolve, reject) => {
//     child_process.exec(command, (error?: any, stdout?: any, stderr?: any) => {
//       if (error) {
//         return reject(error)
//       }

//       if (stderr) {
//         return resolve(stderr)
//       }

//       return resolve(stdout)
//     })
//   })
// }

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
