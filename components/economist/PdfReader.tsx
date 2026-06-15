type PdfReaderProps = {
  title: string;
  previewUrl: string;
  downloadHref: string;
};

const PdfReader = ({ title, previewUrl, downloadHref }: PdfReaderProps) => (
  <div className="h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-md border border-border bg-background">
    <iframe
      title={title}
      src={`${previewUrl}#toolbar=1&navpanes=0`}
      className="h-full w-full bg-background"
      referrerPolicy="same-origin"
    />
    <div className="sr-only">
      <a href={previewUrl} target="_blank" rel="noreferrer">
        Open PDF
      </a>
      <a href={downloadHref}>Download PDF</a>
    </div>
  </div>
);

export default PdfReader;
