import { CurrencyComboBox } from '@/components/CurrencyComboBox';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className='container flex max-w-2xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:px-8 lg:px-0'>
      <div>
        <h1 className='text-center text-2xl sm:text-3xl'>
          Bem vindo, <span className='ml-2 font-bold'>{user.firstName}! 👋</span>
        </h1>
        <h2 className='mt-4 text-center text-sm sm:text-base text-muted-foreground'>
          Escolha qual moeda você quer utilizar 💱
        </h2>
        <h3 className='mt-2 text-center text-xs sm:text-sm text-muted-foreground'>
          Você pode mudar isso quando quiser
        </h3>
      </div>

      <Separator />

      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-lg sm:text-xl'>Moeda</CardTitle>
          <CardDescription className='text-sm sm:text-base'>Escolha a moeda para suas movimentações</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>

      <Separator />

      <Button className='w-full'>
        <Link href='/' className='font-bold'>
          Vamos começar
        </Link>
      </Button>

      <div className='mt-8 w-full flex justify-center'>
        <Logo />
      </div>
    </div>
  );
}

export default page;
