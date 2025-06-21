"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, Send, History, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RequestHistory {
  id: number
  method: string
  url: string
  headers: string
  body: string
  response: string
  statusCode: number
  responseTime: number
  createdAt: string
}

interface ApiResponse {
  data: any
  status: number
  headers: Record<string, string>
  responseTime: number
}

export default function RestClient() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async (page = 1) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/history?page=${page}&limit=10`)
      const data = await res.json()
      setHistory(data.requests)
      setTotalPages(data.totalPages)
      setHistoryPage(page)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch request history",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const sendRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const startTime = Date.now()

      const res = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          url,
          headers: headers ? JSON.parse(headers) : {},
          body: body || undefined,
        }),
      })

      const responseData = await res.json()
      const endTime = Date.now()

      if (!res.ok) {
        throw new Error(responseData.error || "Request failed")
      }

      const apiResponse: ApiResponse = {
        ...responseData,
        responseTime: endTime - startTime,
      }

      setResponse(apiResponse)

      // Refresh history after successful request
      fetchHistory(1)

      toast({
        title: "Success",
        description: `Request completed in ${apiResponse.responseTime}ms`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Request failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryItem = (item: RequestHistory) => {
    setMethod(item.method)
    setUrl(item.url)
    setHeaders(item.headers)
    setBody(item.body)

    // Parse and set the response
    try {
      const parsedResponse = JSON.parse(item.response)
      setResponse({
        data: parsedResponse,
        status: item.statusCode,
        headers: {},
        responseTime: item.responseTime,
      })
    } catch (error) {
      console.error("Failed to parse response:", error)
    }
  }

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">REST Client</h1>
        <p className="text-muted-foreground">A Postman-like REST API client with request history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Make Request
              </CardTitle>
              <CardDescription>Configure and send HTTP requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method and URL */}
              <div className="flex gap-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Enter request URL (e.g., https://jsonplaceholder.typicode.com/posts)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={sendRequest} disabled={loading}>
                  {loading ? "Sending..." : "Send"}
                </Button>
              </div>

              <Tabs defaultValue="headers" className="w-full">
                <TabsList>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                <TabsContent value="headers" className="space-y-2">
                  <Label htmlFor="headers">Headers (JSON format)</Label>
                  <Textarea
                    id="headers"
                    placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    rows={4}
                  />
                </TabsContent>
                <TabsContent value="body" className="space-y-2">
                  <Label htmlFor="body">Request Body</Label>
                  <Textarea
                    id="body"
                    placeholder="Enter request body (JSON, text, etc.)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Response Panel */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Response</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(response.status)}>{response.status}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {response.responseTime}ms
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="response" className="w-full">
                  <TabsList>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="response">
                    <ScrollArea className="h-96 w-full rounded border p-4">
                      <pre className="text-sm">{formatJson(response.data)}</pre>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="headers">
                    <ScrollArea className="h-96 w-full rounded border p-4">
                      <pre className="text-sm">{formatJson(response.headers)}</pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Request History
              </CardTitle>
              <CardDescription>Recent API requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-4">Loading history...</div>
              ) : (
                <>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border rounded cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => loadHistoryItem(item)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.method}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(item.statusCode)}`}>{item.statusCode}</Badge>
                          </div>
                          <div className="text-sm font-medium truncate mb-1">{item.url}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                            <span>{item.responseTime}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchHistory(historyPage - 1)}
                          disabled={historyPage <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {historyPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchHistory(historyPage + 1)}
                          disabled={historyPage >= totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
