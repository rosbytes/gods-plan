"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema } from "@/Schemas/ContactSchema";
import { z } from "zod";
import { socialLinks } from "@/constant";

type ContactFormData = z.infer<typeof ContactSchema>;

export const ContactTwo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
    const text = `Hello, I have a question about Republic of Sabjiwala.\n\nName: ${data.fullname}\nEmail: ${data.email}\nPhone: ${data.phone || "N/A"}\nMessage: ${data.feedback}`;
    const url = `https://wa.me/${socialLinks.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="custom-apercu flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-5 w-[80%] max-w-3xl space-y-6 rounded-lg p-8"
      >
        <h2 className="mb-10 text-center text-xl font-semibold">
          Got any questions about R.O.S. ? We&#39;re here to help.
        </h2>
        <div>
          <label className="mb-1 block text-xl font-extrabold text-gray-700">
            Full Name<span className="text-red-500"> *</span>
          </label>
          <input
            {...register("fullname")}
            placeholder="Enter your Full Name for easy communication."
            className="w-full rounded-md border border-gray-300 p-3 placeholder-gray-400 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {errors.fullname && (
            <p className="mt-1 text-xs text-red-500">
              {errors.fullname.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xl font-extrabold text-gray-700">
            E-mail Address<span className="text-red-500"> *</span>
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="Enter your E-mail Address. Eg: hello@gmail.com"
            className="w-full rounded-md border border-gray-300 p-3 placeholder-gray-400 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xl font-extrabold text-gray-700">
            Phone Number<span className="ml-1 text-gray-400">(Optional)</span>
          </label>
          <input
            {...register("phone")}
            placeholder="Enter your Phone Number in case of any urgent communication."
            className="w-full rounded-md border border-gray-300 p-3 placeholder-gray-400 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {/* {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )} */}
        </div>
        <div>
          <label className="mb-1 block text-xl font-extrabold text-gray-700">
            Your Message<span className="text-red-500"> *</span>
          </label>
          <textarea
            {...register("feedback")}
            placeholder="Leave a message for us..."
            className="h-32 w-full resize-none rounded-md border border-gray-300 p-3 placeholder-gray-400 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          ></textarea>
          {errors.feedback && (
            <p className="mt-1 text-xs text-red-500">
              {errors.feedback.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-green-500 px-12 py-2 text-lg font-semibold text-white transition hover:bg-green-600"
            style={{ width: "fit-content" }}
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};
