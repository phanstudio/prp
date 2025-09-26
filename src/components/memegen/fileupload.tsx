// import React, { forwardRef, useImperativeHandle, useRef } from "react";

// interface FileUploadProps {
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }

// const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
//   ({ onChange }, ref) => {
//     const hiddenInputRef = useRef<HTMLInputElement>(null);

//     // Expose the ref of the hidden input to parent
//     useImperativeHandle(ref, () => hiddenInputRef.current as HTMLInputElement);

//     return (
//       <div className="space-y-2">
//         {/* Hidden input */}
//         <input
//           type="file"
//           ref={hiddenInputRef}
//           onChange={onChange}
//           accept="image/*"
//           className="hidden"
//         />

//         {/* Custom trigger */}
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={() => hiddenInputRef.current?.click()}
//         >
//           📂 Upload Image
//         </button>
//       </div>
//     );
//   }
// );

// export default FileUpload;


import React, { forwardRef } from "react";

interface FileUploadProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onChange }, ref) => {
    return (
      <label className="btn-primary cursor-pointer btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
        📂 Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          ref={ref}
          className="hidden"
        />
      </label>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
