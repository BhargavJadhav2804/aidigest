import * as pdfjs from 'pdfjs-dist';
//@ts-expect-error
import * as pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';



pdfjs.GlobalWorkerOptions.workerSrc = import.meta.url + 'pdfjs-dist/build/pdf.worker.mjs';
console.log("LOADED")
self.onmessage = async (e: { data: { file: File } }) => {
    let file = e.data.file

    if (!file) return;

    const recursiveTextSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500,
        chunkOverlap: 100
    });

    const loader = new WebPDFLoader(file, {
        pdfjs: async () => pdfjs,
    });
    const docs = await loader.load();
    let tokens = await recursiveTextSplitter.splitDocuments(docs);
    if (tokens.length === 0) {
        self.postMessage({ processDone: false })
        // let form = new FormData()
        // form.append('file', file)
        // form.append("fileName", file.name.slice(0, 25))

        // let req = await fetch('/api/uploadPdf', {
        //     method: "POST",
        //     body: form
        // })

        // console.log(await req.json())
    } else {
        let totalPages = tokens[tokens.length - 1].metadata.loc.pageNumber
        self.postMessage({ processDone: true, document: tokens, totalPages })
    }
}