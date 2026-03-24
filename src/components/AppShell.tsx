"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Button, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <Flex
        maxW="7xl"
        mx="auto"
        w="full"
        px={{ base: 4, md: 6 }}
        pt={5}
        pb={4}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex
          align="center"
          gap={3}
          cursor="pointer"
          onClick={() => router.push('/dashboard')}
        >
          <Image src="/todo_hogar_color.svg" alt="Todo Hogar Factory" width={28} height={28} />
          <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="wide" textTransform="uppercase">
            Admin
          </Text>
        </Flex>

        <Flex align="center" gap={2}>
          {(user?.displayName || user?.email) && (
            <Text fontSize="sm" color="gray.400" display={{ base: 'none', md: 'block' }}>
              {user.displayName ?? user.email}
            </Text>
          )}
          <Button size="sm" variant="ghost" colorScheme="gray" color="gray.400" onClick={signOutUser}>
            Cerrar sesión
          </Button>
        </Flex>
      </Flex>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
