export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">Contact</h1>
      <p className="text-xl">
        If you have any questions or feedback, please contact us at
        <a href="mailto:support@qrmory.com" className="text-blue-500">
          support@qrmory.com
        </a>
      </p>
    </div>
  );
}
