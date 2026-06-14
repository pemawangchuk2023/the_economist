type LibraryNoticeProps = {
  error?: string;
  missingConfig?: string[];
};

const LibraryNotice = ({ error, missingConfig }: LibraryNoticeProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p>{error}</p>
      {missingConfig?.length ? (
        <p className="mt-1">Missing: {missingConfig.join(", ")}</p>
      ) : null}
    </div>
  );
};

export default LibraryNotice;
