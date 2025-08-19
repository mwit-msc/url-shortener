import toast from 'react-hot-toast'

export const useToast = () => {
  return {
    toast: (options: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (options.variant === 'destructive') {
        return toast.error(options.description || options.title || '')
      }
      return toast.success(options.description || options.title || '')
    }
  }
}