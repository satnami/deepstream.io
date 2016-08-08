/* global describe, expect, it, jasmine */
var ListenerTestUtils = require( './listener-test-utils' );
var tu;

fdescribe( 'listener-registry-local-load-balancing', function() {
	beforeEach(function() {
		tu = new ListenerTestUtils();
	});

	describe( 'with a single provider', function(){

		it( 'accepts a subscription', function() {
			// 1.  provider does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2.  clients request a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 3.  provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			// 4.  provider responds with ACCEPT
			tu.providerAccepts( 1, 'a/.*', 'a/1' )
			// 5.  send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 6.  clients discards a/1
			tu.clientUnsubscribesTo( 1, 'a/1')
			// 7.  provider gets a SR
			tu.providerGetsSubscriptionRemoved( 1, 'a/.*', 'a/1' )
			// 8.  send publishing=false to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', false )
			// 9.  a/1 should have no active provider
			tu.subscriptionHasActiveProvider( 'a/1', false )
			// 10. recieving unknown accept/reject throws an error
			tu.acceptMessageThrowsError( 1, 'a/.*', 'a/1' )
			tu.rejectMessageThrowsError( 1, 'a/.*', 'a/1' )
		});

		it( 'rejects a subscription', function() {
			// 1.  provider does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2.  clients request a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 3.  provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			// 4.  provider responds with ACCEPT
			tu.providerRejects( 1, 'a/.*', 'a/1' )
			// 5.  clients discards a/1
			tu.clientUnsubscribesTo( 1, 'a/1')
			// 6. provider should not get a SR
			tu.providerRecievedNoNewMessages( 1 );
		});

		it( 'rejects a subscription with a pattern for which subscriptions already exists', function() {
			// 0. subscription already made for b/1
			tu.subscriptionAlreadyMadeFor( 'b/1' )
			// 1. provider does listen a/.*
			tu.providerListensTo( 1, 'b/.*' )
			// 2. provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'b/.*', 'b/1' )
			// 3. provider responds with REJECT
			tu.providerRejects( 1, 'b/.*', 'b/1' )
			// 4. clients discards b/1
			tu.clientUnsubscribesTo( 1, 'b/1')
			// 5. provider should not get a SR
			tu.providerRecievedNoNewMessages( 1 )
		});

		it( 'accepts a subscription with a pattern for which subscriptions already exists', function() {
			// 0. subscription already made for b/1
			tu.subscriptionAlreadyMadeFor( 'b/1' )
			// 1. provider does listen a/.*
			tu.providerListensTo( 1, 'b/.*' )
			// 2. provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'b/.*', 'b/1' )
			// 3. provider responds with ACCEPT
			tu.providerAccepts( 1, 'b/.*', 'b/1' )
			// 4. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'b/1', true )
			// 5. clients discards b/1
			tu.clientUnsubscribesTo( 1, 'b/1')
			// 6. provider should not get a SR
			tu.providerGetsSubscriptionRemoved( 1, 'b/.*', 'b/1' )
			// 7. send publishing=false to the clients
			tu.publishUpdateSentToSubscribers( 'b/1', false )
		});

		it( 'accepts a subscription for 2 clients', function() {
			// 1. provider does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 3. provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			// 4. provider responds with ACCEPT
			tu.providerAccepts( 1, 'a/.*', 'a/1' )
			// 5. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 6. client 2 requests a/1
			tu.clientSubscribesTo( 2, 'a/1' )
			// 7. provider doesnt get told anything
			tu.providerRecievedNoNewMessages( 1 );
			// 8. client 2 gets publishing=true
			tu.clientRecievesPublishedUpdate( 2, 'a/1', true )
			// 9.  client 1 discards a/1
			tu.clientUnsubscribesTo( 1, 'a/1' )
			// 10. client 2 recieved nothing
			tu.clientRecievedNoNewMessages( 2 )
			// 11.  client 2 discards a/1
			tu.clientUnsubscribesTo( 2, 'a/1' )
			// 12. provider should get a SR
			tu.providerGetsSubscriptionRemoved( 1, 'a/.*', 'a/1' )
			// 13. a/1 should have no active provider
			tu.subscriptionHasActiveProvider( 'a/1', false )
		});

		it( 'accepts a subscription for 2 clients', function() {
			// 1. provider does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 3. provider gets a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			// 4. provider responds with ACCEPT
			tu.providerAccepts( 1, 'a/.*', 'a/1' )
			// 5. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 6. provider 1 subscribes a/1
			tu.providerSubscribesTo( 1, 'a/1' )
			// 7.  client 1 discards a/1
			tu.clientUnsubscribesTo( 1, 'a/1' )
			// 8.  provider gets send Subscription removed because provider is the last subscriber
			tu.providerGetsSubscriptionRemoved( 1, 'a/.*', 'a/1' )
		});
	});

	describe( 'with multiple providers', function(){

		it( 'first rejects, seconds accepts', function() {
			// 1. provider 1 does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2. provider 2 does listen a/[0-9]
			tu.providerListensTo( 2, 'a/[0-9]' )
			// 3.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 4. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			tu.providerRecievedNoNewMessages( 2 )
			// 5. provider 1 responds with REJECTS
			tu.providerRejects( 1, 'a/.*', 'a/1' )
			// 6 provider 2 should get a SP and provider 1 should not get a SP
			tu.providerRecievedNoNewMessages( 1 )
			tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
			// 7. provider 2 responds with ACCEPTS
			tu.providerAccepts( 2, 'a/[0-9]', 'a/1' )
			// 8. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 9. client 1 unsubscribed to a/1
			tu.clientUnsubscribesTo( 1, 'a/1' )
			// 10. provider 2 gets a SR and provider 1 gets nothing
			tu.providerRecievedNoNewMessages( 1 )
			tu.providerGetsSubscriptionRemoved( 2, 'a/[0-9]', 'a/1' )
			// 12. send publishing=false to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', false )
		});

		it( 'first accepts, seconds does nothing', function() {
			// 1. provider 1 does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2. provider 2 does listen a/[0-9]
			tu.providerListensTo( 2, 'a/[0-9]' )
			// 3.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 4. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			tu.providerRecievedNoNewMessages( 2 )
			// 5. provider 2 does not get sent anything
			tu.providerRecievedNoNewMessages( 2 )
			// 6. provider 1 accepts
			tu.providerAccepts( 1, 'a/.*', 'a/1' )
			// 12. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 6. client 1 unsubscribed to a/1
			tu.clientUnsubscribesTo( 1, 'a/1' )
			// 10. provider 1 gets a SR and provider 2 gets nothing
			tu.providerGetsSubscriptionRemoved( 1, 'a/.*', 'a/1' )
			tu.providerRecievedNoNewMessages( 2 )
			// 12. send publishing=false to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', false )
		});

		it( 'first rejects, seconds - which start listening after first gets SP - accepts', function() {
			// 1. provider 1 does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 3.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 4. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			// 2. provider 2 does listen a/[0-9]
			tu.providerListensTo( 2, 'a/[0-9]' )
			// 6. provider 1 rejects
			tu.providerRejects( 1, 'a/.*', 'a/1' )
			// 10. provider 1 gets a SR and provider 2 gets nothing
			tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
			tu.providerRecievedNoNewMessages( 1 )
			// 6. provider 1 accepts
			tu.providerAccepts( 2, 'a/[0-9]', 'a/1' )
			// 12. send publishing=false to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
		});

		it( 'no messages after unlisten', function() {
			// 1. provider 1 does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2. provider 2 does listen a/[0-9]
			tu.providerListensTo( 2, 'a/[0-9]' )
			// 3.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 4. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			tu.providerRecievedNoNewMessages( 2 )
			// 2. provider 2 does unlisten a/[0-9]
			tu.providerUnlistensTo( 2, 'a/[0-9]' )
			// 6. provider 1 responds with REJECTS
			tu.providerRejects( 1, 'a/.*', 'a/1' )
			// 7
			tu.providerRecievedNoNewMessages( 1  )
			tu.providerRecievedNoNewMessages( 2 )
		});

		it( 'provider 1 accepts a subscription and disconnects then provider 2 gets a SP', function() {
			// 1. provider 1 does listen a/.*
			tu.providerListensTo( 1, 'a/.*' )
			// 2. provider 2 does listen a/[0-9]
			tu.providerListensTo( 2, 'a/[0-9]' )
			// 3.  client 1 requests a/1
			tu.clientSubscribesTo( 1, 'a/1' )
			// 4. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
			tu.providerRecievedNoNewMessages( 2 )
			// 5. provider 1 responds with ACCEPT
			tu.providerAccepts( 1, 'a/.*', 'a/1' )
			// 13. subscription has active provider
			tu.subscriptionHasActiveProvider( 'a/1', true )
			// 7.  client 1 requests a/1
			tu.providerLosesItsConnection( 1 )
			// 8. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', false )
			// 9. subscription doesnt have active provider
			tu.subscriptionHasActiveProvider( 'a/1', false )
			// 10. provider 1 gets a SP and provider 2 should not get a SP
			tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
			// 11. provider 1 responds with ACCEPT
			tu.providerAccepts( 2, 'a/[0-9]', 'a/1' )
			// 12. send publishing=true to the clients
			tu.publishUpdateSentToSubscribers( 'a/1', true )
			// 13. subscription has active provider
			tu.subscriptionHasActiveProvider( 'a/1', true )
		});

		/**
		Publisher Timeouts
		*/
		describe( 'publisher timeouts', function() {

			beforeEach( function() {
				// 1. provider 1 does listen a/.*
				tu.providerListensTo( 1, 'a/.*' )
				// 2. provider 2 does listen a/[0-9]
				tu.providerListensTo( 2, 'a/[0-9]' )
				// 3.  client 1 requests a/1
				tu.clientSubscribesTo( 1, 'a/1' )
				// 4. provider 1 gets a SP and provider 2 should not get a SP
				tu.providerGetsSubscriptionFound( 1, 'a/.*', 'a/1' )
				tu.providerRecievedNoNewMessages( 2 )
			});

			it( 'provider 1 times out, provider 2 accepts', function(done) {
				// 5. Timeout occurs
				setTimeout(function() {
				// 6. provider 2 gets a SP
				tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
				tu.providerRecievedNoNewMessages( 1 )
				// 7. provider 1 responds with ACCEPT
				tu.providerAccepts( 1, 'a/[0-9]', 'a/1' )
				// 8. send publishing=true to the clients
				tu.publishUpdateSentToSubscribers( 'a/1', true )
				// 9. subscription doesnt have active provider
				tu.subscriptionHasActiveProvider( 'a/1', true )
				// 9
				tu.providerRecievedNoNewMessages( 2 )
				done()
				}, 25)
			});

			it( 'provider 1 times out, but then it accepts but will be ignored because provider 2 accepts as well', function(done) {
				// 5. Timeout occurs
				setTimeout(function() {
				// 6. provider 2 gets a SP
				tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
				tu.providerRecievedNoNewMessages( 1 )
				// 7. provider 1 responds with ACCEPT
				tu.providerAcceptsButIsntAcknowledged( 1, 'a/.*', 'a/1' )
				// 8. client 1 recieves no update
				tu.providerRecievedNoNewMessages( 1 )
				// 9. provider 2 responds with ACCEPT
				tu.providerAccepts( 2, 'a/[0-9]', 'a/1' )
				// 10. send publishing=true to the clients
				tu.publishUpdateSentToSubscribers( 'a/1', true )
				// 11. subscription doesnt have active provider
				tu.subscriptionHasActiveProvider( 'a/1', true )
				// 12. provider 1 gets a SR and provider 2 gets nothing
				tu.providerGetsSubscriptionRemoved( 1, 'a/.*', 'a/1' )
				tu.providerRecievedNoNewMessages( 2 )
				done()
				}, 25)
			});

			it( 'provider 1 times out, but then it accept and will be used because provider 2 rejects', function(done) {
				// 5. Timeout occurs
				setTimeout(function() {
				// 6. provider 2 gets a SP
				tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
				tu.providerRecievedNoNewMessages( 1 )
				// 7. provider 1 responds with ACCEPT
				tu.providerAcceptsButIsntAcknowledged( 1, 'a/.*', 'a/1' )
				// 8. subscription doesnt have active provider
				tu.subscriptionHasActiveProvider( 'a/1', false )
				// 9. provider 2 rejects and provider 2 accepts is used
				tu.providerRejectsAndPreviousTimeoutProviderThatAcceptedIsUsed( 2, 'a/[0-9]', 'a/1' )
				// 10. send publishing=true to the clients
				tu.publishUpdateSentToSubscribers( 'a/1', true )
				// 11. subscription doesnt have active provider
				tu.subscriptionHasActiveProvider( 'a/1', true )
				done()
				}, 25)
			});

			xit( 'provider 1 and 2 times out and 3 rejects, 1 and 2 accepts later and 1 wins', function(done) {
				// 5. provider 3 does listen a/[1]
				tu.providerListensTo( 3, 'a/[1]' )
				// 6. Timeout occurs
				setTimeout(function() {
				// 7. Provider 2 gets subscription found
				tu.providerGetsSubscriptionFound( 2, 'a/[0-9]', 'a/1' )
				tu.providerRecievedNoNewMessages( 1 )
				tu.providerRecievedNoNewMessages( 3 )
				// 8. Timeout occurs
				setTimeout(function() {
				// 9. Provider 3 gets subscription found
				tu.providerGetsSubscriptionFound( 3, 'a/[1]', 'a/1' )
				tu.providerRecievedNoNewMessages( 1 )
				tu.providerRecievedNoNewMessages( 2 )
				// 10. provider 1 responds with ACCEPT
				tu.providerAcceptsButIsntAcknowledged( 1, 'a/.*', 'a/1' )
				// 11. provider 2 responds with ACCEPT
				tu.providerAcceptsAndIsSentSubscriptionRemoved( 2, 'a/[0-9]', 'a/1' )
				// 12. provider 3 responds with reject
				tu.providerRejectsAndPreviousTimeoutProviderThatAcceptedIsUsed( 3, 'a/[1]', 'a/1' )
				// 13. send publishing=true to the clients
				tu.publishUpdateSentToSubscribers( 'a/1', true )
				// 14. First provider is not sent anything
				tu.providerRecievedNoNewMessages( 1 )
				done()
				}, 25)
				}, 25)
			});
		});
	});
});