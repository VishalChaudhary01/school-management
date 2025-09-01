import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
export default function AddSchool() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.filename;
    }
    toast.error('Image upload failed');
    throw new Error('Image upload failed');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let imagePath = '';

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      const schoolData = {
        ...data,
        image: imagePath,
      };

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      });

      const result = await response.json();

      if (result.success) {
        reset();
        setImageFile(null);
        setImagePreview('');
        toast.success(result.message);
        router.push('/');
      } else {
        console.error('Error:', error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full md:max-w-[560px] mx-auto min-h-screen py-6 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Add School</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        <LabelledInput name="name" label="Name" register={register} required />
        <LabelledInput name="address" label="Address" register={register} />
        <LabelledInput name="city" label="City" register={register} />
        <LabelledInput name="state" label="State" register={register} />
        <LabelledInput
          name="email_id"
          label="Email"
          type="email"
          register={register}
          required
        />
        <LabelledInput
          name="contact"
          label="Contact Number"
          register={register}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function LabelledInput({
  label,
  name,
  type = 'text',
  register,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        {...register(name, { required })}
        className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}
