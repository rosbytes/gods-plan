type CardProps = {
  title: string;
  role: string;
  description: string;
  button: string;
  slogan: string;
  gradient: string;
  formLink: string;
};

const JoinCard: React.FC<CardProps> = ({
  title,
  role,
  description,
  slogan,
  button,
  gradient,
  formLink,
}) => (
  <div
    className={`flex flex-col items-center rounded-2xl bg-gradient-to-br px-7 py-8 shadow-lg ${gradient} text-white`}
  >
    <div className="flex flex-grow flex-col items-center">
      <div className="custom-apercu mb-4 text-lg">{title}</div>
      <div className="custom-roquen mb-3 text-3xl font-extrabold">{role}</div>
      <div className="custom-apercu mb-7 text-center leading-snug">
        {description}
      </div>
    </div>

    <div className="flex flex-col items-center">
      <div className="custom-apercu mb-5 text-center">{slogan}</div>
      <a
        target="_blank"
        href={formLink}
        className="custom-apercu rounded-full bg-white px-7 py-3 text-lg font-semibold text-black hover:bg-gray-200"
      >
        {button}
      </a>
    </div>
  </div>
);

export default JoinCard;
