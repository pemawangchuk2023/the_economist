type PdfReaderProps = {
  title: string;
  signedUrl: string;
};

const PdfReader = ({ title, signedUrl }: PdfReaderProps) => (
  <div className="h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-md border border-border bg-muted">
    <iframe
      title={title}
      src={signedUrl}
      className="h-full w-full bg-background"
      referrerPolicy="no-referrer"
    />
  </div>
);

export default PdfReader;
