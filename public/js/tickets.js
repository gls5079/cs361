function notes(passin){
	for(var i = 0; i < passin.length; i++){
		if(passin[i].priority == 1){
			console.log("New Priority 1 Ticket: " + passin[i].title + "\n");
			//passin[i].notified = true;
		}

		if(passin[i].priority == 2){
			console.log("New Priority 2 Ticket: " + passin[i].title + "\n");
			//passin[i].notified = true;

		}

		if(passin[i].priority == 3){
			console.log("New Priority 3 Ticket: " + passin[i].title + "\n");
			//passin[i].notified = true;

		}

		if(passin[i].priority == 4){
			console.log("New Priority 4 Ticket: " + passin[i].title + "\n");
			//passin[i].notified = true;

		}

		if(passin[i].priority == 5){
			console.log("New Priority 5 Ticket: " + passin[i].title + "\n");
			//passin[i].notified = true;

		}
	}
}
//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();

    //Allow for multiple functions
    var async = require('async');

    //Get the tickets table
    function gettickets(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT tickets.id, category, title, issue, member_name, sub_date, priority, note FROM tickets", function(err, tb1) {
                if (err) {
                    return callback(err, []);
                }

		notes(tb1);
		
                return callback(null, tb1);
            });
        }
    }

    //Search trough the tickets table based on given filters in handlebars
    function searchFunction(req, res, mysql, context, complete) {
        var query = "SELECT tickets.id, category, title, issue, member_name, sub_date, priority, note FROM tickets WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.tickets = results;
            complete();
        });
    };

    //Render the page with the loaded tables
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                tickets: gettickets(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('tickets', results);
            }
        );
    });

    //Render the search results based on selected criteria
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('tickets', context);
            };
        };
    });

    //Update a row from tickets table baed on id
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tickets SET priority = ?, member_name = ?, note = ? WHERE id = ?";
        var inserts = [req.body.editPriority, req.body.editMember, req.body.editNote, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/tickets');
            }
        });
    });

    //Delete an entry from the table based on client id
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM tickets WHERE id = ?";
        var inserts = [req.body.deleteGID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/tickets');
            }
        });
    });
    return router;
}()
/*
 *function toastNotifications() {

    'use strict';

    var options = {
        prependTo: document.body.childNodes[0],
        lifeSpan: 10000,
        position: 'top-right',
        animate: false,
        animateDuration: 0
    };

    var classes = {
        container: 'toast-container',
        animate: 'toast-exit',
        default: 'toast',
        success: 'toast-success',
        info: 'toast-info',
        warning: 'toast-warn',
        error: 'toast-error'
    };

    var toastada = {

        setOptions: setOptions,

        setClasses: setClasses,

        success: function(msg) {
            placeToast(msg, 'success');
        },

        info: function(msg) {
            placeToast(msg, 'info');
        },

        warning: function(msg) {
            placeToast(msg, 'warning');
        },

        error: function(msg) {
            placeToast(msg, 'error');
        }

    };

    function setOptions(opts) {

        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                if (key in options) {
                    options[key] = opts[key];
                }
            }
        }

    }

    function setClasses(classDict) {

        for (var key in classDict) {
            if (classDict.hasOwnProperty(key)) {
                if (key in classes) {
                    classes[key] = classDict[key];
                }
            }
        }

    }

    function shimForIe(node) {
        Object.defineProperty(node, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                if (this.parentNode !== null)
                    this.parentNode.removeChild(this);
            }
        });
    }

    function placeToast(html, toastType) {

        var toastContainer = document.querySelector('.' + classes.container);

        var containerExists = !!toastContainer;

        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = classes.container;
            shimForIe(toastContainer);
        }

        var newToast = document.createElement('div');
        newToast.className = classes.default + ' ' + classes[toastType];
        shimForIe(newToast);

        newToast.innerHTML = html;

        if (!containerExists) {

            // Set toast container position
            switch(options.position) {

                case 'top-right':
                    toastContainer.style.top = '10px';
                    toastContainer.style.right = '10px';
                    break;

                default:
                    toastContainer.style.top = '10px';
                    toastContainer.style.right = '10px';
            }

            document.body.insertBefore(toastContainer, options.prependTo);

        }

        toastContainer.insertBefore(newToast, toastContainer.childNodes[0]);

        // This timeout is used for the duration that the
        // toast will stay on the page
        setTimeout(function() {

            // Animation is set to perform
            if (options.animate && options.animateDuration) {

                newToast.classList.add(classes.animate);

                // This timeout is used to defer the reomval of the
                // toast from the dom for `options.animateDuration`
                // milliseconds
                setTimeout(function() {

                    newToast.remove();

                    var numToasts = document.querySelector('.' + classes.container).childNodes.length;

                    if (!numToasts) {
                        toastContainer.remove();
                    }

                }, options.animateDuration);

            } else {

                newToast.remove();

                var numToasts = document.querySelector('.' + classes.container).childNodes.length;

                if (!numToasts) {
                    toastContainer.remove();
                }

            }

        }, options.lifeSpan);

    }

    window.toastada = toastada;

};


 * */
