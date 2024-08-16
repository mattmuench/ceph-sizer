<B>Calculation of viability for replication</B>
 |------------------------------|--------------------|--------------------|-------------------------------------------------------------------------------------------------------------------------------|
 |                              |                    |Tests               |Enough Servers in DC for local replicas
 |                              |Depending on        |single DC           |SSD                     |HDD                 |multiple DC                 |SSD                         |HDD
 |No workload is using this DC  |DC number           |ignore              |                        |                    |ignore                      |                            |
 |single replica                |#DC                 |don't care          |                        |                    |reject                      |                            |
 |replica 2                     |main DCs = 1        |check               |replica <= #servers     |reject              |reject                      |reject                      |reject
 |                              |main DCs=2          |check               |replica <= #servers     |reject              |reject                      |reject                      |reject
 |replica 3                     |main DC = 1         |check               |replica <= #servers     |replica < #servers  |check #DCs => 3             |#servers                    |replica/#DCs <=#servers+1
 |replica 4                     |main DC = 1         |check               |replica <= #servers     |replica <= #servers |check #DCs => #replicas     |#servers                    |#servers
 |                              |                    |                    |                        |                    |check #DCs => replicas/2    |replica/#DCs <=#servers     |replica/#DCs <=#servers
 |                              |                    |                    |                        |                    |check #DCs < #replicas/2    |reject                      |reject
 |replica 5+                    |main DC = 1         |check               |replica <= #servers     |replica <= #servers |check #DCs => #replicas     |#servers                    |#servers
 |                              |                    |                    |                        |                    |check #DCs < #replicas      |replica/#DCs <=#servers     |replica/#DCs <=#servers