import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { homeByRole } from '@/lib/navigation'
import { login } from './authSlice'
import FormField from './FormField'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}`)
      navigate(location.state?.from ?? homeByRole[result.payload.role] ?? '/account', { replace: true })
    } else {
      toast.error(result.payload?.detail ?? 'Login failed')
    }
  }

  return (
    <section className="mx-auto flex max-w-md px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>Customers, rental partners and admins all log in here.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="grid gap-4">
            <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
            <p className="text-sm text-muted-foreground">
              New here?{' '}
              <Link to="/register" className="underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </section>
  )
}
