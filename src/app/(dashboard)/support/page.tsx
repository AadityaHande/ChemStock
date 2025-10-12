
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
  return (
    <div className="flex items-center justify-center">
        <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your Name" />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Please describe your issue in detail." className="min-h-[150px]" />
            </div>
            </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>Submit</Button>
        </CardFooter>
        </Card>
    </div>
  )
}
