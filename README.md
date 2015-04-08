# Qube - Sidekick component

This is a component to be installed on each cube-service defined on the system. It provides some common, but vital, functionality for each micro service in the system.

The provided features include:

1. Subscribes for events(found in routes) then re-route AMQB messages into HTTP requests.
1. All inbound-communicate goes through this client
1. Exposes a local HTTP server at http://localhost:8080/
1. All outbound-communicate goes through this client
1. It communicates with the Cube Router, your apps don't have to know where is the Router, Gateway or any other system components or micro-services.
1. Installs Redis to cache outbound calls.
1. Listens to cube-wide system events to purge the cache intelligently.

The client is installed in each micro-service node:

1. it abstracts the communications throughout the system.

    The micro-service app doesn't need to handle the communications to CMB. As we are going to use a messaging protocol, not REST, if we didn't abstract the communications all micro-service would have to refactor the code to handle the asynchronous nature of AMQB. This client remove all this complexity by providing a standard HTTP server with REST interface at a local port. So all the app should do is to consume the REST API at http://localhost:8080/ and that's it :)

2. add the caching layer and make sure the data is kept fresh.

    Saving as a couple hundred milliseconds each request by caching the most requested data locally(to the current node) and fetching it from Redis(from memory) instantaneously, agains, the apps isn't aware of this, they don't need any code change, they should consume the http://localhost:8080/ and most probably they will be served a cached version without having to fetch the data from other nodes. 

## Example workflow:

In the "ticketing" micro-service, a /tickets/?eventId={eventId} is exposed, here's a simplified pseudo-code of the implementation:
```
  eventId = params.eventId

  //Get tickets available to this event
  tickets = database.getTickets.where('eventId': eventId);

  //We need to get number of registration of each ticket
  database.getTicketsRegisteration.where('tickets','in',tickets);

  //We need to get number of PAID registration of each ticket, this involves the "payment" micro-service
  payments = http.makeRequest('http://localhost:8080/api/v1/payments/?ticketId=123&status=completed');
```
As you can see, no special code is needed to get data from other micro-services.
