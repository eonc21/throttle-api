General Decisions

- I decided to go with TypeScript. NestJS is a good choice because of its layered architecture, since I will need to extend the code and architect it for long term, then this offers a good structure. Also widely maintained and used, big community.
- I added a Claude.md file to make sure Claude follows coding and testing conventions I impose on my own self, if I use it.
- I added a GitHub pipeline to make sure the code actually runs when pushed. Testing stages are separate for future-proofing, mostly parallelisation reasons, otherwise pipeline might take really long if everything is sequential.

Authorization

- I am using a Guard, which is a component created specifically for authorization in NestJS
