import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COUNTRY_CODE, toLocalPhone } from '@/lib/format'
import { registerCustomer, registerPartner } from './authSlice'
import FormField from './FormField'

// Indian mobile numbers: 10 digits starting 6–9. The form shows +91 but only the 10 digits are sent and stored.
const indianMobile = /^[6-9]\d{9}$/
const phoneMessage = 'Enter a valid 10-digit mobile number'
const localPhone = z.string().transform(toLocalPhone)

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(150),
  email: z.email('Enter a valid email'),
  phone: localPhone.refine((v) => v === '' || indianMobile.test(v), phoneMessage),
  password: z.string().min(8, 'At least 8 characters').max(128),
})

const partnerSchema = customerSchema.extend({
  phone: localPhone.refine((v) => indianMobile.test(v), phoneMessage),
  businessName: z.string().trim().min(1, 'Enter your business name').max(200),
  address: z.string().trim().max(500).optional(),
})

function useRegisterForm(schema, action, onDone) {
  const dispatch = useDispatch()
  const form = useForm({ resolver: zodResolver(schema) })

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await dispatch(action({ ...values, phone: values.phone || null }))
    if (action.fulfilled.match(result)) {
      onDone(result.payload)
    } else {
      const error = result.payload
      // Map server-side validation errors (ProblemDetails.errors) back onto the fields.
      for (const [field, messages] of Object.entries(error?.errors ?? {})) {
        const name = field.charAt(0).toLowerCase() + field.slice(1)
        form.setError(name, { message: messages[0] })
      }
      toast.error(error?.detail ?? error?.title ?? 'Sign-up failed')
    }
  })

  return { ...form, onSubmit }
}

function CustomerForm({ onDone }) {
  const { register, onSubmit, formState } = useRegisterForm(customerSchema, registerCustomer, onDone)
  const { errors, isSubmitting } = formState
  return (
    <form onSubmit={onSubmit} noValidate>
      <CardContent className="grid gap-4">
        <FormField id="c-name" label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <FormField id="c-email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <FormField
          id="c-phone"
          label="Mobile number (optional)"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix={COUNTRY_CODE}
          placeholder="98765 43210"
          hint="For booking updates by SMS or WhatsApp"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          id="c-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
      </CardContent>
      <CardFooter className="mt-6">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </CardFooter>
    </form>
  )
}

function PartnerForm({ onDone }) {
  const { register, onSubmit, formState } = useRegisterForm(partnerSchema, registerPartner, onDone)
  const { errors, isSubmitting } = formState
  return (
    <form onSubmit={onSubmit} noValidate>
      <CardContent className="grid gap-4">
        <FormField
          id="p-business"
          label="Business name"
          autoComplete="organization"
          error={errors.businessName?.message}
          {...register('businessName')}
        />
        <FormField id="p-name" label="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <FormField id="p-email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <FormField
          id="p-phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix={COUNTRY_CODE}
          placeholder="98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          id="p-address"
          label="Business address (optional)"
          autoComplete="street-address"
          error={errors.address?.message}
          {...register('address')}
        />
        <FormField
          id="p-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
      </CardContent>
      <CardFooter className="mt-6 flex flex-col gap-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Apply as a partner'}
        </Button>
        <p className="text-sm text-muted-foreground">An admin reviews every partner before they receive bookings.</p>
      </CardFooter>
    </form>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('as') === 'partner' ? 'partner' : 'customer'

  const onDone = (user) => {
    toast.success(user.role === 'Partner' ? 'Application received' : `Welcome, ${user.name}`)
    navigate('/account', { replace: true })
  }

  return (
    <section className="mx-auto flex max-w-md px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Already have one?{' '}
            <Link to="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <Tabs value={tab} onValueChange={(value) => setSearchParams(value === 'partner' ? { as: 'partner' } : {}, { replace: true })}>
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="customer">I want to rent</TabsTrigger>
              <TabsTrigger value="partner">I rent out vehicles</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="customer" className="mt-4">
            <CustomerForm onDone={onDone} />
          </TabsContent>
          <TabsContent value="partner" className="mt-4">
            <PartnerForm onDone={onDone} />
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  )
}
