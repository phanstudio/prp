interface ImageCardProps {
    label: string;
    src: string;
    alt: string;
}

const ImageCard = ({ label, src, alt }: ImageCardProps) => {
    return (
        <div className="mt-2">
            <div className="mb-4">
                <span className="text-sm uppercase tracking-wider text-automotive-light-foreground/70 font-section">
                    {label}
                </span>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-2xl h-72 lg:h-96">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover scale-110 transition-transform duration-500 hover:scale-125"
                />
            </div>
        </div>
    );
};

export default ImageCard;
  