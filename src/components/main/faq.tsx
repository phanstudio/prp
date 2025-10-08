import React from "react";

// should turn to a card
const Faq: React.FC = () => {
  return (
    <div className="mt-6 card bg-base-100 w-full shadow-sm">
    {/* // <div className="mt-6 bg-base-100 w-full"> */}
      <div className="card-body">
        <div className="collapse collapse-plus bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-3" defaultChecked />
          <div className="collapse-title font-semibold">
            How do I create an account?
          </div>
          <div className="collapse-content text-sm">
            Click the "Sign Up" button in the top right corner and follow the
            registration process.
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-3" />
          <div className="collapse-title font-semibold">
            I forgot my password. What should I do?
          </div>
          <div className="collapse-content text-sm">
            Click on "Forgot Password" on the login page and follow the
            instructions sent to your email.
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-3" />
          <div className="collapse-title font-semibold">How to use</div>
          <div className="collapse-content text-sm text-left">
            1. Upload an image <br />
            2. Click "Add Text" in the right panel
            <br />
            3. Click text elements to select them <br />
            4. Edit text properties in the right panel
            <br />
            5. Drag text in the canvas to reposition <br />
            6. Save your image when done
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
