import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Mockups() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">ShiftTrac App Mockups</h1>

      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="desktop">Desktop View</TabsTrigger>
          <TabsTrigger value="mobile">Mobile View</TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Home Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/mockups/desktop-home.png"
                alt="Desktop Home View"
                width={1200}
                height={800}
                className="w-full"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button asChild>
                <a href="/mockups/desktop-home.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Calendar Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/mockups/desktop-calendar.png"
                alt="Desktop Calendar View"
                width={1200}
                height={800}
                className="w-full"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button asChild>
                <a href="/mockups/desktop-calendar.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Stats Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/mockups/desktop-stats.png"
                alt="Desktop Stats View"
                width={1200}
                height={800}
                className="w-full"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button asChild>
                <a href="/mockups/desktop-stats.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Profile Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/mockups/desktop-profile.png"
                alt="Desktop Profile View"
                width={1200}
                height={800}
                className="w-full"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button asChild>
                <a href="/mockups/desktop-profile.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Home Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
              <Image
                src="/mockups/mobile-home.png"
                alt="Mobile Home View"
                width={375}
                height={812}
                className="w-full"
              />
            </div>
            <div className="flex justify-center mt-2">
              <Button asChild>
                <a href="/mockups/mobile-home.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Calendar Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
              <Image
                src="/mockups/mobile-calendar.png"
                alt="Mobile Calendar View"
                width={375}
                height={812}
                className="w-full"
              />
            </div>
            <div className="flex justify-center mt-2">
              <Button asChild>
                <a href="/mockups/mobile-calendar.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Stats Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
              <Image
                src="/mockups/mobile-stats.png"
                alt="Mobile Stats View"
                width={375}
                height={812}
                className="w-full"
              />
            </div>
            <div className="flex justify-center mt-2">
              <Button asChild>
                <a href="/mockups/mobile-stats.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Profile Page</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
              <Image
                src="/mockups/mobile-profile.png"
                alt="Mobile Profile View"
                width={375}
                height={812}
                className="w-full"
              />
            </div>
            <div className="flex justify-center mt-2">
              <Button asChild>
                <a href="/mockups/mobile-profile.png" download>
                  Download Image
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
